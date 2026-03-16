package fr.jeroka.apijava.service;

import fr.jeroka.apijava.dto.dashboard.MonthlyRevenueDto;
import fr.jeroka.apijava.repository.InvoiceRepository;
import fr.jeroka.apijava.repository.MessageRepository;
import fr.jeroka.apijava.repository.PersonRepository;
import fr.jeroka.apijava.repository.QuoteRepository;
import fr.jeroka.apijava.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final PersonRepository personRepository;
    private final MessageRepository messageRepository;
    private final QuoteRepository quoteRepository;
    private final InvoiceRepository invoiceRepository;

    public DashboardService(UserRepository userRepository,
                            PersonRepository personRepository,
                            MessageRepository messageRepository,
                            QuoteRepository quoteRepository,
                            InvoiceRepository invoiceRepository) {
        this.userRepository = userRepository;
        this.personRepository = personRepository;
        this.messageRepository = messageRepository;
        this.quoteRepository = quoteRepository;
        this.invoiceRepository = invoiceRepository;
    }

    public DashboardStats getStats(UUID companyId) {
        var now = Instant.now().atZone(ZoneOffset.UTC);
        var startOfMonth = now.withDayOfMonth(1).toInstant();
        var startOfWeek = now.minusWeeks(1).toInstant();

        return new DashboardStats(
                personRepository.countByCompanyId(companyId),
                messageRepository.countByCompanyId(companyId),
                invoiceRepository.countByCompanyId(companyId),
                quoteRepository.countByCompanyId(companyId),
                userRepository.countByCompanyIdAndCreatedAtAfter(companyId, startOfMonth),
                messageRepository.countByCompanyIdAndCreatedAtAfter(companyId, startOfWeek),
                invoiceRepository.countByCompanyIdAndCreatedAtAfter(companyId, startOfMonth),
                quoteRepository.countByCompanyIdAndCreatedAtAfter(companyId, startOfMonth),
                personRepository.findTop5ByCompanyIdOrderByCreatedAtDesc(companyId),
                messageRepository.findTop5ByCompanyIdOrderByCreatedAtDesc(companyId),
                invoiceRepository.findTop5ByCompanyIdOrderByCreatedAtDesc(companyId),
                buildMonthlyRevenue(companyId),
                buildInvoiceStatusCounts(companyId)
        );
    }

    private List<MonthlyRevenueDto> buildMonthlyRevenue(UUID companyId) {
        return invoiceRepository.findMonthlyRevenueLast6Months(companyId).stream()
                .map(row -> new MonthlyRevenueDto(
                        (String) row[0],
                        new BigDecimal(row[1].toString())
                ))
                .toList();
    }

    private Map<String, Long> buildInvoiceStatusCounts(UUID companyId) {
        return invoiceRepository.countByStatusAndCompanyId(companyId).stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));
    }
}
