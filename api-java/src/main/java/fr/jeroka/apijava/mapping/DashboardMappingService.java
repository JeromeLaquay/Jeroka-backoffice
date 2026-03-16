package fr.jeroka.apijava.mapping;

import fr.jeroka.apijava.dto.dashboard.DashboardStatsResponse;
import fr.jeroka.apijava.dto.dashboard.RecentClientDto;
import fr.jeroka.apijava.dto.dashboard.RecentInvoiceDto;
import fr.jeroka.apijava.dto.dashboard.RecentMessageDto;
import fr.jeroka.apijava.entity.Invoice;
import fr.jeroka.apijava.entity.Message;
import fr.jeroka.apijava.entity.Person;
import fr.jeroka.apijava.repository.PersonRepository;
import fr.jeroka.apijava.service.DashboardService;
import fr.jeroka.apijava.service.DashboardStats;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Couche mapping Dashboard : Controller -> DashboardMappingService -> DashboardService.
 */
@Service
public class DashboardMappingService {

    private final DashboardService dashboardService;
    private final PersonRepository personRepository;

    public DashboardMappingService(DashboardService dashboardService, PersonRepository personRepository) {
        this.dashboardService = dashboardService;
        this.personRepository = personRepository;
    }

    public DashboardStatsResponse getStats(UUID companyId) {
        var stats = dashboardService.getStats(companyId);
        var clientNames = buildClientNameMap(stats.recentInvoices());
        return toResponse(companyId, stats, clientNames);
    }

    private Map<UUID, String> buildClientNameMap(List<Invoice> invoices) {
        var personIds = invoices.stream()
                .map(Invoice::getPersonId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());
        return personRepository.findAllById(personIds).stream()
                .collect(Collectors.toMap(Person::getId, p -> p.getFirstName() + " " + p.getLastName()));
    }

    private static DashboardStatsResponse toResponse(UUID companyId, DashboardStats stats, Map<UUID, String> clientNames) {
        return new DashboardStatsResponse(
                companyId.toString(),
                stats.totalClients(),
                stats.totalMessages(),
                stats.totalInvoices(),
                stats.totalQuotes(),
                stats.newClientsMonth(),
                stats.newMessagesWeek(),
                stats.newInvoicesMonth(),
                stats.newQuotesMonth(),
                toRecentClients(stats.recentClients()),
                toRecentMessages(stats.recentMessages()),
                toRecentInvoices(stats.recentInvoices(), clientNames),
                stats.monthlyRevenue(),
                stats.invoiceStatusCounts()
        );
    }

    private static List<RecentClientDto> toRecentClients(List<Person> clients) {
        return clients.stream()
                .map(p -> new RecentClientDto(p.getId(), p.getFirstName(), p.getLastName(), p.getEmail(), p.getCreatedAt()))
                .toList();
    }

    private static List<RecentMessageDto> toRecentMessages(List<Message> messages) {
        return messages.stream()
                .map(m -> new RecentMessageDto(m.getId(), m.getFirstName(), m.getLastName(), m.getEmail(), m.getSubject(), m.getStatus(), m.getSource(), m.getCreatedAt()))
                .toList();
    }

    private static List<RecentInvoiceDto> toRecentInvoices(List<Invoice> invoices, Map<UUID, String> clientNames) {
        return invoices.stream()
                .map(i -> new RecentInvoiceDto(i.getId(), i.getInvoiceNumber(), i.getPersonId(), clientNames.getOrDefault(i.getPersonId(), "—"), i.getStatus(), i.getTotalTtc(), i.getCreatedAt()))
                .toList();
    }
}
