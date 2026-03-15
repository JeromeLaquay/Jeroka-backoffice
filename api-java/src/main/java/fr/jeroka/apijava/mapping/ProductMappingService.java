package fr.jeroka.apijava.mapping;

import fr.jeroka.apijava.dto.common.PageDto;
import fr.jeroka.apijava.dto.product.*;
import fr.jeroka.apijava.entity.Product;
import fr.jeroka.apijava.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class ProductMappingService {

    private final ProductService productService;

    public ProductMappingService(ProductService productService) {
        this.productService = productService;
    }

    public PageDto<ProductResponse> listByCompany(UUID companyId, int page, int limit) {
        var p = productService.findByCompanyId(companyId, page, limit);
        var items = p.getContent().stream().map(this::toResponse).toList();
        return PageDto.of(items, page, limit, p.getTotalElements());
    }

    public ProductResponse getById(UUID id, UUID companyId) {
        return toResponse(productService.getByIdAndCompanyId(id, companyId));
    }

    public ProductResponse create(UUID companyId, CreateProductRequest request) {
        var product = toEntity(companyId, request);
        return toResponse(productService.create(product));
    }

    public ProductResponse update(UUID id, UUID companyId, UpdateProductRequest request) {
        var product = productService.getByIdAndCompanyId(id, companyId);
        applyUpdate(product, request);
        return toResponse(productService.update(product));
    }

    public void delete(UUID id, UUID companyId) {
        productService.delete(id, companyId);
    }

    public ProductStatsResponse getStats(UUID companyId) {
        var total = productService.countByCompanyId(companyId);
        var active = productService.countByCompanyIdAndIsActiveTrue(companyId);
        return new ProductStatsResponse(total, active);
    }

    public ProductCategoryResponse getCategories(UUID companyId) {
        var categories = productService.findDistinctCategoriesByCompanyId(companyId);
        return new ProductCategoryResponse(categories);
    }

    public ProductResponse toResponse(Product p) {
        return new ProductResponse(
                p.getId().toString(),
                p.getName(),
                p.getDescription(),
                p.getShortDescription(),
                p.getSku(),
                p.getCategory(),
                p.getPriceHt(),
                p.getVatNumber(),
                p.getCostPrice(),
                p.getStockQuantity(),
                p.getMinStockLevel(),
                p.getUnit(),
                Boolean.TRUE.equals(p.getIsActive()),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }

    private Product toEntity(UUID companyId, CreateProductRequest req) {
        var p = new Product();
        p.setCompanyId(companyId);
        p.setName(req.name().trim());
        p.setDescription(trim(req.description()));
        p.setShortDescription(trim(req.shortDescription()));
        p.setSku(req.sku().trim());
        p.setCategory(trim(req.category()));
        p.setPriceHt(req.priceHt() != null ? req.priceHt() : BigDecimal.ZERO);
        p.setVatNumber(req.vatNumber() != null ? req.vatNumber() : new BigDecimal("20"));
        p.setCostPrice(req.costPrice());
        p.setStockQuantity(req.stockQuantity() != null ? req.stockQuantity() : 0);
        p.setMinStockLevel(req.minStockLevel() != null ? req.minStockLevel() : 0);
        p.setUnit(req.unit() != null ? req.unit() : "pièce");
        return p;
    }

    private void applyUpdate(Product p, UpdateProductRequest req) {
        if (req.name() != null) p.setName(req.name().trim());
        if (req.description() != null) p.setDescription(req.description().trim());
        if (req.shortDescription() != null) p.setShortDescription(req.shortDescription().trim());
        if (req.category() != null) p.setCategory(req.category().trim());
        if (req.priceHt() != null) p.setPriceHt(req.priceHt());
        if (req.vatNumber() != null) p.setVatNumber(req.vatNumber());
        if (req.costPrice() != null) p.setCostPrice(req.costPrice());
        if (req.stockQuantity() != null) p.setStockQuantity(req.stockQuantity());
        if (req.minStockLevel() != null) p.setMinStockLevel(req.minStockLevel());
        if (req.unit() != null) p.setUnit(req.unit());
        if (req.active() != null) p.setIsActive(req.active());
    }

    private static String trim(String s) {
        return s != null ? s.trim() : null;
    }
}
