package fr.jeroka.apijava.mapping;

import fr.jeroka.apijava.dto.common.PageDto;
import fr.jeroka.apijava.dto.publication.*;
import fr.jeroka.apijava.entity.Publication;
import fr.jeroka.apijava.service.PublicationService;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class PublicationMappingService {

    private final PublicationService publicationService;

    public PublicationMappingService(PublicationService publicationService) {
        this.publicationService = publicationService;
    }

    public PageDto<PublicationResponse> listByCompany(UUID companyId, int page, int limit) {
        var p = publicationService.findByCompanyId(companyId, page, limit);
        var items = p.getContent().stream().map(this::toResponse).toList();
        return PageDto.of(items, page, limit, p.getTotalElements());
    }

    public PublicationResponse getById(UUID id, UUID companyId) {
        return toResponse(publicationService.getByIdAndCompanyId(id, companyId));
    }

    public PublicationResponse create(UUID companyId, CreatePublicationRequest request) {
        var publication = toEntity(companyId, request);
        return toResponse(publicationService.create(publication));
    }

    public PublicationResponse update(UUID id, UUID companyId, UpdatePublicationRequest request) {
        var publication = publicationService.getByIdAndCompanyId(id, companyId);
        applyUpdate(publication, request);
        return toResponse(publicationService.update(publication));
    }

    public void delete(UUID id, UUID companyId) {
        publicationService.delete(id, companyId);
    }

    public PublicationResponse toResponse(Publication pub) {
        return new PublicationResponse(
                pub.getId().toString(),
                pub.getTitle(),
                pub.getContent(),
                pub.getExcerpt(),
                pub.getFeaturedImage(),
                pub.getType(),
                pub.getStatus(),
                pub.getCategory(),
                pub.getSlug(),
                pub.getViewCount(),
                pub.getLikeCount(),
                pub.getShareCount(),
                pub.getScheduledAt(),
                pub.getPublishedAt(),
                pub.getSeoTitle(),
                pub.getSeoDescription(),
                pub.getCreatedAt(),
                pub.getUpdatedAt()
        );
    }

    private Publication toEntity(UUID companyId, CreatePublicationRequest req) {
        var p = new Publication();
        p.setCompanyId(companyId);
        p.setTitle(req.title().trim());
        p.setContent(req.content().trim());
        p.setExcerpt(trim(req.excerpt()));
        p.setFeaturedImage(trim(req.featuredImage()));
        p.setType(req.type() != null ? req.type() : "standard");
        p.setStatus(req.status() != null ? req.status() : "draft");
        p.setCategory(trim(req.category()));
        p.setSlug(req.slug().trim().toLowerCase().replaceAll("\\s+", "-"));
        p.setScheduledAt(req.scheduledAt());
        p.setPublishedAt(req.publishedAt());
        p.setSeoTitle(trim(req.seoTitle()));
        p.setSeoDescription(trim(req.seoDescription()));
        return p;
    }

    private void applyUpdate(Publication p, UpdatePublicationRequest req) {
        if (req.title() != null) p.setTitle(req.title().trim());
        if (req.content() != null) p.setContent(req.content().trim());
        if (req.excerpt() != null) p.setExcerpt(req.excerpt().trim());
        if (req.featuredImage() != null) p.setFeaturedImage(req.featuredImage().trim());
        if (req.type() != null) p.setType(req.type());
        if (req.status() != null) p.setStatus(req.status());
        if (req.category() != null) p.setCategory(req.category().trim());
        if (req.slug() != null) p.setSlug(req.slug().trim().toLowerCase().replaceAll("\\s+", "-"));
        if (req.scheduledAt() != null) p.setScheduledAt(req.scheduledAt());
        if (req.publishedAt() != null) p.setPublishedAt(req.publishedAt());
        if (req.seoTitle() != null) p.setSeoTitle(req.seoTitle().trim());
        if (req.seoDescription() != null) p.setSeoDescription(req.seoDescription().trim());
    }

    private static String trim(String s) {
        return s != null ? s.trim() : null;
    }
}
