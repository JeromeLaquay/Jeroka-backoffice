package fr.jeroka.apijava.service;

import fr.jeroka.apijava.repository.InvoiceRepository;
import fr.jeroka.apijava.repository.MessageRepository;
import fr.jeroka.apijava.repository.PersonRepository;
import fr.jeroka.apijava.repository.QuoteRepository;
import fr.jeroka.apijava.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

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

        long totalClients = personRepository.countByCompanyId(companyId);
        long totalMessages = messageRepository.countByCompanyId(companyId);
        long totalInvoices = invoiceRepository.countByCompanyId(companyId);
        long totalQuotes = quoteRepository.countByCompanyId(companyId);
        long newUsersMonth = userRepository.countByCompanyIdAndCreatedAtAfter(companyId, startOfMonth);
        long newMessagesWeek = messageRepository.countByCompanyIdAndCreatedAtAfter(companyId, startOfWeek);
        long newInvoicesMonth = invoiceRepository.countByCompanyIdAndCreatedAtAfter(companyId, startOfMonth);
        long newQuotesMonth = quoteRepository.countByCompanyIdAndCreatedAtAfter(companyId, startOfMonth);

        return new DashboardStats(
                totalClients, totalMessages, totalInvoices, totalQuotes,
                0, newMessagesWeek, newInvoicesMonth, newQuotesMonth
        );
    }
}
