package fr.jeroka.apijava.service;

import fr.jeroka.apijava.entity.Invoice;
import fr.jeroka.apijava.exception.ApiException;
import fr.jeroka.apijava.repository.InvoiceRepository;
import fr.jeroka.apijava.repository.PersonRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PersonRepository personRepository;

    public InvoiceService(InvoiceRepository invoiceRepository, PersonRepository personRepository) {
        this.invoiceRepository = invoiceRepository;
        this.personRepository = personRepository;
    }

    public Page<Invoice> findByCompanyId(UUID companyId, int page, int limit) {
        Pageable p = PageRequest.of(Math.max(0, page - 1), Math.min(100, Math.max(1, limit)));
        return invoiceRepository.findByCompanyIdOrderByCreatedAtDesc(companyId, p);
    }

    public Invoice getByIdAndCompanyId(UUID id, UUID companyId) {
        return invoiceRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ApiException("Facture introuvable", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Invoice create(Invoice invoice) {
        if (invoice.getInvoiceNumber() == null || invoice.getInvoiceNumber().isBlank()) {
            invoice.setInvoiceNumber(generateNextInvoiceNumber(invoice.getCompanyId()));
        }
        if (!personRepository.existsById(invoice.getPersonId())) {
            throw new ApiException("Personne (client) introuvable", HttpStatus.BAD_REQUEST);
        }
        return invoiceRepository.save(invoice);
    }

    @Transactional
    public Invoice update(Invoice invoice) {
        return invoiceRepository.save(invoice);
    }

    @Transactional
    public Invoice markPaid(UUID id, UUID companyId, BigDecimal amount) {
        var inv = getByIdAndCompanyId(id, companyId);
        inv.setAmountPaid(inv.getAmountPaid().add(amount != null ? amount : inv.getTotalTtc()));
        inv.setAmountDue(inv.getTotalTtc().subtract(inv.getAmountPaid()));
        if (inv.getAmountDue().compareTo(BigDecimal.ZERO) <= 0) {
            inv.setStatus("paid");
            inv.setPaidAt(Instant.now());
        }
        return invoiceRepository.save(inv);
    }

    @Transactional
    public void delete(UUID id, UUID companyId) {
        invoiceRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ApiException("Facture introuvable", HttpStatus.NOT_FOUND));
        invoiceRepository.deleteById(id);
    }

    public String getNextInvoiceNumber(UUID companyId) {
        return generateNextInvoiceNumber(companyId);
    }

    public long countByCompanyId(UUID companyId) {
        return invoiceRepository.countByCompanyId(companyId);
    }

    public long countByCompanyIdAndStatus(UUID companyId, String status) {
        return invoiceRepository.countByCompanyIdAndStatus(companyId, status);
    }

    public BigDecimal sumTotalTtcByCompanyId(UUID companyId) {
        return invoiceRepository.sumTotalTtcByCompanyId(companyId);
    }

    public BigDecimal sumAmountPaidByCompanyId(UUID companyId) {
        return invoiceRepository.sumAmountPaidByCompanyId(companyId);
    }

    public BigDecimal sumAmountDueByCompanyId(UUID companyId) {
        return invoiceRepository.sumAmountDueByCompanyId(companyId);
    }

    private String generateNextInvoiceNumber(UUID companyId) {
        return invoiceRepository.findFirstByCompanyIdOrderByInvoiceNumberDesc(companyId)
                .map(Invoice::getInvoiceNumber)
                .map(InvoiceService::incrementNumber)
                .orElse("FAC-001");
    }

    private static String incrementNumber(String last) {
        if (last == null || !last.contains("-")) return "FAC-001";
        try {
            int num = Integer.parseInt(last.substring(last.lastIndexOf('-') + 1));
            return last.substring(0, last.lastIndexOf('-') + 1) + String.format("%03d", num + 1);
        } catch (NumberFormatException e) {
            return "FAC-001";
        }
    }
}
