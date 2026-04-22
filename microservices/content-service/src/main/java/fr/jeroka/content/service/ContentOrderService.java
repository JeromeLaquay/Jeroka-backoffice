package fr.jeroka.content.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.jeroka.content.entity.ContentOrderEntity;
import fr.jeroka.content.exception.ContentApiException;
import fr.jeroka.content.repository.ContentOrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ContentOrderService {

    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {};
    private static final TypeReference<List<Map<String, Object>>> LIST_TYPE = new TypeReference<>() {};

    private final ContentOrderRepository orders;
    private final ObjectMapper objectMapper;

    public ContentOrderService(ContentOrderRepository orders, ObjectMapper objectMapper) {
        this.orders = orders;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> list(UUID companyId, int page, int limit, String search, String status, String period) {
        List<Map<String, Object>> filtered = filtered(companyId, search, status, period);
        int safePage = Math.max(page, 1);
        int safeLimit = Math.max(1, Math.min(limit, 100));
        int from = (safePage - 1) * safeLimit;
        int to = Math.min(filtered.size(), from + safeLimit);
        List<Map<String, Object>> items = from >= filtered.size() ? List.of() : filtered.subList(from, to);
        return Map.of("orders", items, "total", filtered.size());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> stats(UUID companyId, String period) {
        List<Map<String, Object>> items = filtered(companyId, null, null, period);
        long pending = items.stream().filter(o -> "pending".equals(string(o.get("status")))).count();
        long delivered = items.stream().filter(o -> "delivered".equals(string(o.get("status")))).count();
        double revenue = items.stream().mapToDouble(o -> decimal(o.get("totalAmount")).doubleValue()).sum();
        return Map.of("total", items.size(), "pending", pending, "delivered", delivered, "revenue", revenue);
    }

    @Transactional
    public Map<String, Object> create(UUID companyId, Map<String, Object> payload) {
        ContentOrderEntity entity = buildEntity(companyId, payload);
        return toPayload(orders.save(entity));
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getById(UUID companyId, UUID orderId) {
        return orders.findByIdAndCompanyId(orderId, companyId)
                .map(this::toPayload)
                .orElseThrow(() -> new ContentApiException("Commande non trouvée", HttpStatus.NOT_FOUND));
    }

    private List<Map<String, Object>> filtered(UUID companyId, String search, String status, String period) {
        return orders.findByCompanyIdOrderByCreatedAtDesc(companyId).stream()
                .map(this::toPayload)
                .filter(order -> matchesSearch(order, search))
                .filter(order -> matchesStatus(order, status))
                .filter(order -> matchesPeriod(order, period))
                .toList();
    }

    @SuppressWarnings("unchecked")
    private ContentOrderEntity buildEntity(UUID companyId, Map<String, Object> payload) {
        List<Map<String, Object>> items = sanitizeItems((List<Map<String, Object>>) payload.get("items"));
        BigDecimal subtotal = totalOf(items, "totalHt");
        BigDecimal tax = totalOf(items, "totalVat");
        BigDecimal shipping = decimal(payload.get("shippingAmount"));
        BigDecimal discount = decimal(payload.get("discountAmount"));
        ContentOrderEntity entity = new ContentOrderEntity();
        entity.setId(UUID.randomUUID());
        entity.setCompanyId(companyId);
        entity.setOrderNumber("CMD-" + (System.currentTimeMillis() % 100000));
        entity.setClientId(uuid(payload.get("clientId")));
        entity.setStatus(stringOr(payload.get("status"), "pending"));
        entity.setClientJson(writeJson(clientPayload(payload.get("clientId"))));
        entity.setItemsJson(writeJson(items));
        entity.setShippingAddressJson(writeJson(payload.get("shippingAddress")));
        entity.setBillingAddressJson(writeJson(payload.get("billingAddress")));
        entity.setPaymentMethod(string(payload.get("paymentMethod")));
        entity.setNotes(string(payload.get("notes")));
        entity.setTrackingNumber(string(payload.get("trackingNumber")));
        entity.setSubtotalHt(subtotal);
        entity.setTaxAmount(tax);
        entity.setShippingAmount(shipping);
        entity.setDiscountAmount(discount);
        entity.setTotalAmount(subtotal.add(tax).add(shipping).subtract(discount).max(BigDecimal.ZERO));
        return entity;
    }

    private List<Map<String, Object>> sanitizeItems(List<Map<String, Object>> rawItems) {
        if (rawItems == null) {
            return List.of();
        }
        return rawItems.stream().map(this::normalizedItem).toList();
    }

    private Map<String, Object> normalizedItem(Map<String, Object> raw) {
        BigDecimal quantity = decimal(raw.get("quantity"));
        BigDecimal unitPrice = decimal(raw.get("unitPrice"));
        BigDecimal discount = decimal(raw.get("discountPercent"));
        BigDecimal vatRate = decimal(raw.get("vatRate"));
        BigDecimal totalHt = quantity.multiply(unitPrice).multiply(BigDecimal.valueOf(100).subtract(discount))
                .divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        BigDecimal totalVat = totalHt.multiply(vatRate).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
        Map<String, Object> item = new HashMap<>();
        item.put("id", UUID.randomUUID().toString());
        item.put("description", string(raw.get("description")));
        item.put("quantity", quantity.doubleValue());
        item.put("unitPrice", unitPrice.doubleValue());
        item.put("discountPercent", discount.doubleValue());
        item.put("vatRate", vatRate.doubleValue());
        item.put("totalHt", totalHt.doubleValue());
        item.put("totalVat", totalVat.doubleValue());
        item.put("totalTtc", totalHt.add(totalVat).doubleValue());
        return item;
    }

    private Map<String, Object> toPayload(ContentOrderEntity entity) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", entity.getId().toString());
        payload.put("orderNumber", entity.getOrderNumber());
        payload.put("clientId", entity.getClientId().toString());
        payload.put("client", readMap(entity.getClientJson()));
        payload.put("status", entity.getStatus());
        payload.put("items", readList(entity.getItemsJson()));
        payload.put("itemsCount", readList(entity.getItemsJson()).size());
        payload.put("subtotalHt", entity.getSubtotalHt().doubleValue());
        payload.put("taxAmount", entity.getTaxAmount().doubleValue());
        payload.put("shippingAmount", entity.getShippingAmount().doubleValue());
        payload.put("discountAmount", entity.getDiscountAmount().doubleValue());
        payload.put("totalAmount", entity.getTotalAmount().doubleValue());
        payload.put("paymentMethod", string(entity.getPaymentMethod()));
        payload.put("shippingAddress", readMap(entity.getShippingAddressJson()));
        payload.put("billingAddress", readMap(entity.getBillingAddressJson()));
        payload.put("notes", string(entity.getNotes()));
        payload.put("trackingNumber", string(entity.getTrackingNumber()));
        payload.put("createdAt", entity.getCreatedAt().toString());
        payload.put("updatedAt", entity.getUpdatedAt().toString());
        return payload;
    }

    private boolean matchesSearch(Map<String, Object> order, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }
        String value = search.trim().toLowerCase();
        String orderNumber = string(order.get("orderNumber")).toLowerCase();
        Map<String, Object> client = readMap(writeJson(order.get("client")));
        return orderNumber.contains(value) || string(client.get("name")).toLowerCase().contains(value);
    }

    private boolean matchesStatus(Map<String, Object> order, String status) {
        return status == null || status.isBlank() || status.equals(order.get("status"));
    }

    private boolean matchesPeriod(Map<String, Object> order, String period) {
        if (period == null || period.isBlank()) {
            return true;
        }
        LocalDate created = Instant.parse(string(order.get("createdAt"))).atZone(ZoneOffset.UTC).toLocalDate();
        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        return switch (period) {
            case "today" -> created.equals(today);
            case "week" -> !created.isBefore(today.minusDays(7));
            case "month" -> created.getMonthValue() == today.getMonthValue() && created.getYear() == today.getYear();
            case "quarter" -> !created.isBefore(today.minusDays(90));
            default -> true;
        };
    }

    private Map<String, Object> clientPayload(Object clientId) {
        return Map.of(
                "id", string(clientId),
                "name", "Client",
                "email", "",
                "avatar_url", "https://ui-avatars.com/api/?name=Client&background=a855f7&color=fff");
    }

    private BigDecimal totalOf(List<Map<String, Object>> items, String key) {
        return items.stream()
                .map(item -> decimal(item.get(key)))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private UUID uuid(Object value) {
        try {
            return UUID.fromString(string(value));
        } catch (Exception ex) {
            throw new ContentApiException("clientId invalide", HttpStatus.BAD_REQUEST);
        }
    }

    private BigDecimal decimal(Object value) {
        try {
            return new BigDecimal(string(value).isBlank() ? "0" : string(value));
        } catch (Exception ex) {
            return BigDecimal.ZERO;
        }
    }

    private String stringOr(Object value, String fallback) {
        String v = string(value);
        return v.isBlank() ? fallback : v;
    }

    private String string(Object value) {
        return value != null ? value.toString() : "";
    }

    private String writeJson(Object value) {
        if (value == null) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            return "{}";
        }
    }

    private Map<String, Object> readMap(String json) {
        if (json == null || json.isBlank() || "null".equals(json)) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(json, MAP_TYPE);
        } catch (Exception ex) {
            return Map.of();
        }
    }

    private List<Map<String, Object>> readList(String json) {
        if (json == null || json.isBlank() || "null".equals(json)) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, LIST_TYPE);
        } catch (Exception ex) {
            return List.of();
        }
    }
}
