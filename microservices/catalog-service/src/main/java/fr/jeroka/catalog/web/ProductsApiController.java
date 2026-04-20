package fr.jeroka.catalog.web;

import fr.jeroka.catalog.security.CatalogJwtCompanyId;
import fr.jeroka.catalog.service.CatalogProductService;
import fr.jeroka.catalog.web.dto.CreateProductRequest;
import fr.jeroka.catalog.web.dto.PageDto;
import fr.jeroka.catalog.web.dto.ProductCategoryResponse;
import fr.jeroka.catalog.web.dto.ProductResponse;
import fr.jeroka.catalog.web.dto.ProductStatsResponse;
import fr.jeroka.catalog.web.dto.UpdateProductRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
public class ProductsApiController {

    private final CatalogProductService catalogProductService;

    public ProductsApiController(CatalogProductService catalogProductService) {
        this.catalogProductService = catalogProductService;
    }

    @GetMapping
    public PageDto<ProductResponse> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return catalogProductService.list(CatalogJwtCompanyId.require(jwt), page, limit);
    }

    @GetMapping("/stats")
    public ProductStatsResponse stats(@AuthenticationPrincipal Jwt jwt) {
        return catalogProductService.stats(CatalogJwtCompanyId.require(jwt));
    }

    @GetMapping("/categories")
    public ProductCategoryResponse categories(@AuthenticationPrincipal Jwt jwt) {
        return catalogProductService.categories(CatalogJwtCompanyId.require(jwt));
    }

    @GetMapping("/{id}")
    public ProductResponse getById(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return catalogProductService.getById(id, CatalogJwtCompanyId.require(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse create(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateProductRequest body) {
        return catalogProductService.create(CatalogJwtCompanyId.require(jwt), body);
    }

    @PutMapping("/{id}")
    public ProductResponse update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductRequest body) {
        return catalogProductService.update(id, CatalogJwtCompanyId.require(jwt), body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        catalogProductService.delete(id, CatalogJwtCompanyId.require(jwt));
    }
}
