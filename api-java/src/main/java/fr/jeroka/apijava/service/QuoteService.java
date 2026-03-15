package fr.jeroka.apijava.service;

import fr.jeroka.apijava.entity.Quote;
import fr.jeroka.apijava.exception.ApiException;
import fr.jeroka.apijava.repository.PersonRepository;
import fr.jeroka.apijava.repository.QuoteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class QuoteService {

    private final QuoteRepository quoteRepository;
    private final PersonRepository personRepository;

    public QuoteService(QuoteRepository quoteRepository, PersonRepository personRepository) {
        this.quoteRepository = quoteRepository;
        this.personRepository = personRepository;
    }

    public Page<Quote> findByCompanyId(UUID companyId, int page, int limit) {
        Pageable p = PageRequest.of(Math.max(0, page - 1), Math.min(100, Math.max(1, limit)));
        return quoteRepository.findByCompanyIdOrderByCreatedAtDesc(companyId, p);
    }

    public Quote getByIdAndCompanyId(UUID id, UUID companyId) {
        return quoteRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ApiException("Devis introuvable", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Quote create(Quote quote) {
        if (quote.getQuoteNumber() == null || quote.getQuoteNumber().isBlank()) {
            quote.setQuoteNumber(generateNextQuoteNumber(quote.getCompanyId()));
        }
        if (!personRepository.existsById(quote.getPersonId())) {
            throw new ApiException("Personne (client) introuvable", HttpStatus.BAD_REQUEST);
        }
        return quoteRepository.save(quote);
    }

    @Transactional
    public Quote update(Quote quote) {
        return quoteRepository.save(quote);
    }

    @Transactional
    public void delete(UUID id, UUID companyId) {
        quoteRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ApiException("Devis introuvable", HttpStatus.NOT_FOUND));
        quoteRepository.deleteById(id);
    }

    public String getNextQuoteNumber(UUID companyId) {
        return generateNextQuoteNumber(companyId);
    }

    public long countByCompanyId(UUID companyId) {
        return quoteRepository.countByCompanyId(companyId);
    }

    public long countByCompanyIdAndStatus(UUID companyId, String status) {
        return quoteRepository.countByCompanyIdAndStatus(companyId, status);
    }

    private String generateNextQuoteNumber(UUID companyId) {
        return quoteRepository.findFirstByCompanyIdOrderByQuoteNumberDesc(companyId)
                .map(q -> incrementNumber(q.getQuoteNumber()))
                .orElse("DEV-001");
    }

    private static String incrementNumber(String last) {
        if (last == null || !last.contains("-")) return "DEV-001";
        try {
            int num = Integer.parseInt(last.substring(last.lastIndexOf('-') + 1));
            return last.substring(0, last.lastIndexOf('-') + 1) + String.format("%03d", num + 1);
        } catch (NumberFormatException e) {
            return "DEV-001";
        }
    }
}
