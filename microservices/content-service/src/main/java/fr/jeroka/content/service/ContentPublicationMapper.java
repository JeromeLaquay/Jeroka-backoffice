package fr.jeroka.content.service;

import fr.jeroka.content.entity.ContentPublicationEntity;
import fr.jeroka.content.web.dto.publication.CreatePublicationRequest;
import fr.jeroka.content.web.dto.publication.PublicationResponse;
import fr.jeroka.content.web.dto.publication.UpdatePublicationRequest;

import java.util.UUID;

public final class ContentPublicationMapper {

    private ContentPublicationMapper() {}

    public static PublicationResponse toResponse(ContentPublicationEntity p) {
        return new PublicationResponse(
                p.getId().toString(),
                p.getTitle(),
                p.getContent(),
                p.getExcerpt(),
                p.getFeaturedImage(),
                p.getType(),
                p.getStatus(),
                p.getCategory(),
                p.getSlug(),
                p.getViewCount(),
                p.getLikeCount(),
                p.getShareCount(),
                p.getScheduledAt(),
                p.getPublishedAt(),
                p.getSeoTitle(),
                p.getSeoDescription(),
                p.getCreatedAt(),
                p.getUpdatedAt());
    }

    public static ContentPublicationEntity toNewEntity(UUID companyId, CreatePublicationRequest req) {
        var p = new ContentPublicationEntity();
        p.setCompanyId(companyId);
        p.setTitle(req.title().trim());
        p.setContent(req.content().trim());
        p.setExcerpt(trim(req.excerpt()));
        p.setFeaturedImage(trim(req.featuredImage()));
        p.setType(req.type() != null ? req.type() : "standard");
        p.setStatus(req.status() != null ? req.status() : "draft");
        p.setCategory(trim(req.category()));
        p.setSlug(normalizeSlug(req.slug()));
        p.setScheduledAt(req.scheduledAt());
        p.setPublishedAt(req.publishedAt());
        p.setSeoTitle(trim(req.seoTitle()));
        p.setSeoDescription(trim(req.seoDescription()));
        return p;
    }

    public static void applyUpdate(ContentPublicationEntity p, UpdatePublicationRequest req) {
        applyPublicationText(p, req);
        applyPublicationSlugAndCategory(p, req);
        applyPublicationDates(p, req);
    }

    private static void applyPublicationText(ContentPublicationEntity p, UpdatePublicationRequest req) {
        if (req.title() != null) {
            p.setTitle(req.title().trim());
        }
        if (req.content() != null) {
            p.setContent(req.content().trim());
        }
        if (req.excerpt() != null) {
            p.setExcerpt(req.excerpt().trim());
        }
        if (req.featuredImage() != null) {
            p.setFeaturedImage(req.featuredImage().trim());
        }
        if (req.type() != null) {
            p.setType(req.type());
        }
        if (req.status() != null) {
            p.setStatus(req.status());
        }
        if (req.seoTitle() != null) {
            p.setSeoTitle(req.seoTitle().trim());
        }
        if (req.seoDescription() != null) {
            p.setSeoDescription(req.seoDescription().trim());
        }
    }

    private static void applyPublicationSlugAndCategory(ContentPublicationEntity p, UpdatePublicationRequest req) {
        if (req.category() != null) {
            p.setCategory(req.category().trim());
        }
        if (req.slug() != null && !req.slug().isBlank()) {
            p.setSlug(normalizeSlug(req.slug()));
        }
    }

    private static void applyPublicationDates(ContentPublicationEntity p, UpdatePublicationRequest req) {
        if (req.scheduledAt() != null) {
            p.setScheduledAt(req.scheduledAt());
        }
        if (req.publishedAt() != null) {
            p.setPublishedAt(req.publishedAt());
        }
    }

    public static String normalizeSlug(String slug) {
        if (slug == null || slug.isBlank()) {
            return "";
        }
        return slug.trim().toLowerCase().replaceAll("\\s+", "-");
    }

    private static String trim(String s) {
        return s != null ? s.trim() : null;
    }
}
