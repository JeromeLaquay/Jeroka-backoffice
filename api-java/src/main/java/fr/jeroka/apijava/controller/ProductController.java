package fr.jeroka.apijava.controller;

import fr.jeroka.apijava.dto.common.PageDto;
import fr.jeroka.apijava.dto.product.*;
import fr.jeroka.apijava.exception.ApiException;
import fr.jeroka.apijava.mapping.ProductMappingService;
import fr.jeroka.apijava.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {

    private final ProductMappingService productMappingService;

    public ProductController(ProductMappingService productMappingService) {
        this.productMappingService = productMappingService;
    }

    @GetMapping
    public PageDto<ProductResponse> list(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return productMappingService.listByCompany(requireCompanyId(principal.companyId()), page, limit);
    }

    @GetMapping("/stats")
    public ProductStatsResponse stats(
            @AuthenticationPrincipal JwtService.UserPrincipal principal) {
        return productMappingService.getStats(requireCompanyId(principal.companyId()));
    }

    @GetMapping("/categories")
    public ProductCategoryResponse categories(
            @AuthenticationPrincipal JwtService.UserPrincipal principal) {
        return productMappingService.getCategories(requireCompanyId(principal.companyId()));
    }

    @GetMapping("/{id}")
    public ProductResponse getById(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id) {
        return productMappingService.getById(id, requireCompanyId(principal.companyId()));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @Valid @RequestBody CreateProductRequest request) {
        return productMappingService.create(requireCompanyId(principal.companyId()), request);
    }

    @PutMapping("/{id}")
    public ProductResponse update(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductRequest request) {
        return productMappingService.update(id, requireCompanyId(principal.companyId()), request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id) {
        productMappingService.delete(id, requireCompanyId(principal.companyId()));
    }

    private static UUID requireCompanyId(String companyId) {
        if (companyId == null || companyId.isBlank()) {
            throw new ApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        return UUID.fromString(companyId);
    }
}
