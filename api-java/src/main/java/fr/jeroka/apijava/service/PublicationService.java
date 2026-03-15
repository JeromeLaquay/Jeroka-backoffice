package fr.jeroka.apijava.service;

import fr.jeroka.apijava.entity.Publication;
import fr.jeroka.apijava.exception.ApiException;
import fr.jeroka.apijava.repository.PublicationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PublicationService {

    private final PublicationRepository publicationRepository;

    public PublicationService(PublicationRepository publicationRepository) {
        this.publicationRepository = publicationRepository;
    }

    public Page<Publication> findByCompanyId(UUID companyId, int page, int limit) {
        Pageable p = PageRequest.of(Math.max(0, page - 1), Math.min(100, Math.max(1, limit)));
        return publicationRepository.findByCompanyIdOrderByCreatedAtDesc(companyId, p);
    }

    public Publication getByIdAndCompanyId(UUID id, UUID companyId) {
        return publicationRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ApiException("Publication introuvable", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Publication create(Publication publication) {
        if (publicationRepository.existsByCompanyIdAndSlug(publication.getCompanyId(), publication.getSlug())) {
            throw new ApiException("Une publication existe déjà avec ce slug pour cette entreprise", HttpStatus.CONFLICT);
        }
        return publicationRepository.save(publication);
    }

    @Transactional
    public Publication update(Publication publication) {
        return publicationRepository.save(publication);
    }

    @Transactional
    public void delete(UUID id, UUID companyId) {
        publicationRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ApiException("Publication introuvable", HttpStatus.NOT_FOUND));
        publicationRepository.deleteById(id);
    }

    public long countByCompanyId(UUID companyId) {
        return publicationRepository.countByCompanyId(companyId);
    }

    public long countByCompanyIdAndStatus(UUID companyId, String status) {
        return publicationRepository.countByCompanyIdAndStatus(companyId, status);
    }
}
