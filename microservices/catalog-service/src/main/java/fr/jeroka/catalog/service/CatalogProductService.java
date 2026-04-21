package fr.jeroka.catalog.service;

import fr.jeroka.catalog.entity.CatalogProductEntity;
import fr.jeroka.catalog.exception.CatalogApiException;
import fr.jeroka.catalog.repository.CatalogProductRepository;
import fr.jeroka.catalog.web.dto.CreateProductRequest;
import fr.jeroka.catalog.web.dto.PageDto;
import fr.jeroka.catalog.web.dto.ProductCategoryResponse;
import fr.jeroka.catalog.web.dto.ProductResponse;
import fr.jeroka.catalog.web.dto.ProductStatsResponse;
import fr.jeroka.catalog.web.dto.UpdateProductRequest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class CatalogProductService {

    private final CatalogProductRepository products;

    public CatalogProductService(CatalogProductRepository products) {
        this.products = products;
    }

    @Transactional(readOnly = true)
    public PageDto<ProductResponse> list(UUID companyId, int page, int limit) {
        Pageable p = PageRequest.of(Math.max(0, page - 1), Math.min(100, Math.max(1, limit)));
        var result = products.findByCompanyId(companyId, p);
        var items = result.getContent().stream().map(CatalogProductMapper::toResponse).toList();
        return PageDto.of(items, page, limit, result.getTotalElements());
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(UUID id, UUID companyId) {
        return CatalogProductMapper.toResponse(loadOwned(id, companyId));
    }

    @Transactional
    public ProductResponse create(UUID companyId, CreateProductRequest req) {
        if (products.existsByCompanyIdAndSku(companyId, req.sku().trim())) {
            throw new CatalogApiException(
                    "Un produit existe déjà avec ce SKU pour cette entreprise", HttpStatus.CONFLICT);
        }
        return CatalogProductMapper.toResponse(
                products.save(CatalogProductMapper.toNewEntity(companyId, req)));
    }

    @Transactional
    public ProductResponse update(UUID id, UUID companyId, UpdateProductRequest req) {
        CatalogProductEntity p = loadOwned(id, companyId);
        CatalogProductMapper.applyUpdate(p, req);
        return CatalogProductMapper.toResponse(products.save(p));
    }

    @Transactional
    public void delete(UUID id, UUID companyId) {
        loadOwned(id, companyId);
        products.deleteById(id);
    }

    @Transactional(readOnly = true)
    public ProductStatsResponse stats(UUID companyId) {
        long total = products.countByCompanyId(companyId);
        long active = products.countByCompanyIdAndIsActiveTrue(companyId);
        return new ProductStatsResponse(total, active);
    }

    @Transactional(readOnly = true)
    public ProductCategoryResponse categories(UUID companyId) {
        return new ProductCategoryResponse(products.findDistinctCategoriesByCompanyId(companyId));
    }

    private CatalogProductEntity loadOwned(UUID id, UUID companyId) {
        return products
                .findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new CatalogApiException("Produit introuvable", HttpStatus.NOT_FOUND));
    }
}
