package fr.jeroka.content.service;

import fr.jeroka.content.entity.ContentPublicationEntity;
import fr.jeroka.content.exception.ContentApiException;
import fr.jeroka.content.repository.ContentPublicationRepository;
import fr.jeroka.content.web.dto.PageDto;
import fr.jeroka.content.web.dto.publication.CreatePublicationRequest;
import fr.jeroka.content.web.dto.publication.PublicationResponse;
import fr.jeroka.content.web.dto.publication.UpdatePublicationRequest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ContentPublicationService {

    private final ContentPublicationRepository publications;

    public ContentPublicationService(ContentPublicationRepository publications) {
        this.publications = publications;
    }

    @Transactional(readOnly = true)
    public PageDto<PublicationResponse> list(UUID companyId, int page, int limit) {
        Pageable p = PageRequest.of(Math.max(0, page - 1), Math.min(100, Math.max(1, limit)));
        var result = publications.findByCompanyIdOrderByCreatedAtDesc(companyId, p);
        var items = result.getContent().stream().map(ContentPublicationMapper::toResponse).toList();
        return PageDto.of(items, page, limit, result.getTotalElements());
    }

    @Transactional(readOnly = true)
    public PublicationResponse getById(UUID id, UUID companyId) {
        return ContentPublicationMapper.toResponse(loadOwned(id, companyId));
    }

    @Transactional
    public PublicationResponse create(UUID companyId, CreatePublicationRequest req) {
        var p = ContentPublicationMapper.toNewEntity(companyId, req);
        if (publications.existsByCompanyIdAndSlug(companyId, p.getSlug())) {
            throw new ContentApiException(
                    "Une publication existe déjà avec ce slug pour cette entreprise", HttpStatus.CONFLICT);
        }
        return ContentPublicationMapper.toResponse(publications.save(p));
    }

    @Transactional
    public PublicationResponse update(UUID id, UUID companyId, UpdatePublicationRequest req) {
        ContentPublicationEntity p = loadOwned(id, companyId);
        assertSlugChangeAllowed(id, companyId, p, req);
        ContentPublicationMapper.applyUpdate(p, req);
        return ContentPublicationMapper.toResponse(publications.save(p));
    }

    @Transactional
    public void delete(UUID id, UUID companyId) {
        loadOwned(id, companyId);
        publications.deleteById(id);
    }

    private void assertSlugChangeAllowed(
            UUID id, UUID companyId, ContentPublicationEntity current, UpdatePublicationRequest req) {
        if (req.slug() == null || req.slug().isBlank()) {
            return;
        }
        String next = ContentPublicationMapper.normalizeSlug(req.slug());
        if (next.isBlank() || next.equals(current.getSlug())) {
            return;
        }
        if (publications.existsByCompanyIdAndSlugAndIdNot(companyId, next, id)) {
            throw new ContentApiException(
                    "Une publication existe déjà avec ce slug pour cette entreprise", HttpStatus.CONFLICT);
        }
    }

    private ContentPublicationEntity loadOwned(UUID id, UUID companyId) {
        return publications
                .findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ContentApiException("Publication introuvable", HttpStatus.NOT_FOUND));
    }
}
