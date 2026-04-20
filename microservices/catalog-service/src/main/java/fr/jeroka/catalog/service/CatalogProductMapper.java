package fr.jeroka.catalog.service;

import fr.jeroka.catalog.entity.CatalogProductEntity;
import fr.jeroka.catalog.web.dto.CreateProductRequest;
import fr.jeroka.catalog.web.dto.ProductResponse;
import fr.jeroka.catalog.web.dto.UpdateProductRequest;

import java.math.BigDecimal;
import java.util.UUID;

public final class CatalogProductMapper {

    private CatalogProductMapper() {}

    public static ProductResponse toResponse(CatalogProductEntity p) {
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
                p.getUpdatedAt());
    }

    public static CatalogProductEntity toNewEntity(UUID companyId, CreateProductRequest req) {
        var p = new CatalogProductEntity();
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

    public static void applyUpdate(CatalogProductEntity p, UpdateProductRequest req) {
        if (req.name() != null) {
            p.setName(req.name().trim());
        }
        if (req.description() != null) {
            p.setDescription(req.description().trim());
        }
        if (req.shortDescription() != null) {
            p.setShortDescription(req.shortDescription().trim());
        }
        if (req.category() != null) {
            p.setCategory(req.category().trim());
        }
        if (req.priceHt() != null) {
            p.setPriceHt(req.priceHt());
        }
        if (req.vatNumber() != null) {
            p.setVatNumber(req.vatNumber());
        }
        if (req.costPrice() != null) {
            p.setCostPrice(req.costPrice());
        }
        if (req.stockQuantity() != null) {
            p.setStockQuantity(req.stockQuantity());
        }
        if (req.minStockLevel() != null) {
            p.setMinStockLevel(req.minStockLevel());
        }
        if (req.unit() != null) {
            p.setUnit(req.unit());
        }
        if (req.active() != null) {
            p.setIsActive(req.active());
        }
    }

    private static String trim(String s) {
        return s != null ? s.trim() : null;
    }
}
