package fr.jeroka.apijava.service;

import fr.jeroka.apijava.entity.Product;
import fr.jeroka.apijava.exception.ApiException;
import fr.jeroka.apijava.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Page<Product> findByCompanyId(UUID companyId, int page, int limit) {
        Pageable p = PageRequest.of(Math.max(0, page - 1), Math.min(100, Math.max(1, limit)));
        return productRepository.findByCompanyId(companyId, p);
    }

    public Product getByIdAndCompanyId(UUID id, UUID companyId) {
        return productRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ApiException("Produit introuvable", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Product create(Product product) {
        if (productRepository.existsByCompanyIdAndSku(product.getCompanyId(), product.getSku())) {
            throw new ApiException("Un produit existe déjà avec ce SKU pour cette entreprise", HttpStatus.CONFLICT);
        }
        return productRepository.save(product);
    }

    @Transactional
    public Product update(Product product) {
        return productRepository.save(product);
    }

    @Transactional
    public void delete(UUID id, UUID companyId) {
        productRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ApiException("Produit introuvable", HttpStatus.NOT_FOUND));
        productRepository.deleteById(id);
    }

    public long countByCompanyId(UUID companyId) {
        return productRepository.countByCompanyId(companyId);
    }

    public long countByCompanyIdAndIsActiveTrue(UUID companyId) {
        return productRepository.countByCompanyIdAndIsActiveTrue(companyId);
    }

    public List<String> findDistinctCategoriesByCompanyId(UUID companyId) {
        return productRepository.findDistinctCategoriesByCompanyId(companyId);
    }
}
