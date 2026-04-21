package fr.jeroka.dashboard.service;

import fr.jeroka.dashboard.exception.DashboardApiException;
import fr.jeroka.dashboard.remote.BillingInvoiceAnalyticsJson;
import fr.jeroka.dashboard.remote.BillingInvoiceItemJson;
import fr.jeroka.dashboard.remote.BillingInvoiceStatsJson;
import fr.jeroka.dashboard.remote.BillingQuoteStatsJson;
import fr.jeroka.dashboard.remote.CrmMessageItemJson;
import fr.jeroka.dashboard.remote.CrmMessageStatsJson;
import fr.jeroka.dashboard.remote.CrmPersonItemJson;
import fr.jeroka.dashboard.remote.CrmPersonStatsJson;
import fr.jeroka.dashboard.remote.JsonPage;
import fr.jeroka.dashboard.web.dto.DashboardStatsResponse;
import fr.jeroka.dashboard.web.dto.MonthlyRevenueDto;
import fr.jeroka.dashboard.web.dto.RecentClientDto;
import fr.jeroka.dashboard.web.dto.RecentInvoiceDto;
import fr.jeroka.dashboard.web.dto.RecentMessageDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.function.Supplier;

@Service
public class DashboardAggregationService {

    private static final ParameterizedTypeReference<JsonPage<CrmPersonItemJson>> PAGE_PERSONS =
            new ParameterizedTypeReference<>() {};
    private static final ParameterizedTypeReference<JsonPage<CrmMessageItemJson>> PAGE_MESSAGES =
            new ParameterizedTypeReference<>() {};
    private static final ParameterizedTypeReference<JsonPage<BillingInvoiceItemJson>> PAGE_INVOICES =
            new ParameterizedTypeReference<>() {};

    private final WebClient webClient;
    private final String crmBase;
    private final String billingBase;

    public DashboardAggregationService(
            WebClient.Builder webClientBuilder,
            @Value("${jeroka.downstream.crm-base-url:http://crm-service:3006}") String crmBase,
            @Value("${jeroka.downstream.billing-base-url:http://billing-service:3008}") String billingBase) {
        this.webClient = webClientBuilder.build();
        this.crmBase = stripTrailingSlash(crmBase);
        this.billingBase = stripTrailingSlash(billingBase);
    }

    public DashboardStatsResponse aggregateStats(String authorizationHeader, UUID companyId) {
        String auth = requireBearer(authorizationHeader);
        var fPersonStats = async(() -> getJson(auth, crmBase + "/api/v1/persons/stats", CrmPersonStatsJson.class));
        var fMessageStats = async(() -> getJson(auth, crmBase + "/api/v1/messages/stats", CrmMessageStatsJson.class));
        var fInvoiceStats = async(() -> getJson(auth, billingBase + "/api/v1/invoices/stats", BillingInvoiceStatsJson.class));
        var fQuoteStats = async(() -> getJson(auth, billingBase + "/api/v1/quotes/stats", BillingQuoteStatsJson.class));
        var fPersonPage = async(() -> getJsonPage(auth, crmBase + "/api/v1/persons?page=1&limit=5", PAGE_PERSONS));
        var fMessagePage = async(() -> getJsonPage(auth, crmBase + "/api/v1/messages?page=1&limit=5", PAGE_MESSAGES));
        var fInvoicePage = async(() -> getJsonPage(auth, billingBase + "/api/v1/invoices?page=1&limit=5", PAGE_INVOICES));
        var fInvoiceAnalytics =
                async(() -> getJson(auth, billingBase + "/api/v1/invoices/analytics", BillingInvoiceAnalyticsJson.class));
        CompletableFuture.allOf(
                        fPersonStats,
                        fMessageStats,
                        fInvoiceStats,
                        fQuoteStats,
                        fPersonPage,
                        fMessagePage,
                        fInvoicePage,
                        fInvoiceAnalytics)
                .join();
        return buildResponse(companyId, fPersonStats.join(), fMessageStats.join(), fInvoiceStats.join(), fQuoteStats.join(), fPersonPage.join(), fMessagePage.join(), fInvoicePage.join(), fInvoiceAnalytics.join(), auth);
    }

    private DashboardStatsResponse buildResponse(
            UUID companyId,
            CrmPersonStatsJson ps,
            CrmMessageStatsJson ms,
            BillingInvoiceStatsJson is,
            BillingQuoteStatsJson qs,
            JsonPage<CrmPersonItemJson> personPage,
            JsonPage<CrmMessageItemJson> messagePage,
            JsonPage<BillingInvoiceItemJson> invoicePage,
            BillingInvoiceAnalyticsJson analytics,
            String auth) {
        List<RecentClientDto> recentClients = mapRecentClients(personPage);
        List<RecentMessageDto> recentMessages = mapRecentMessages(messagePage);
        List<RecentInvoiceDto> recentInvoices = mapRecentInvoices(invoicePage, auth);
        List<MonthlyRevenueDto> monthly = mapMonthly(analytics);
        Map<String, Long> statusCounts = analytics != null && analytics.statusCounts() != null
                ? analytics.statusCounts()
                : Map.of();
        long totalClients = ps != null ? ps.total() : 0L;
        long newClientsMonth = ps != null ? ps.createdThisMonth() : 0L;
        long totalMessages = ms != null ? ms.total() : 0L;
        long newMessagesWeek = ms != null ? ms.weekCount() : 0L;
        long totalInvoices = is != null ? is.total() : 0L;
        long newInvoicesMonth = is != null ? is.createdThisMonth() : 0L;
        long totalQuotes = qs != null ? qs.total() : 0L;
        long newQuotesMonth = qs != null ? qs.createdThisMonth() : 0L;
        return new DashboardStatsResponse(
                companyId.toString(),
                totalClients,
                totalMessages,
                totalInvoices,
                totalQuotes,
                newClientsMonth,
                newMessagesWeek,
                newInvoicesMonth,
                newQuotesMonth,
                recentClients,
                recentMessages,
                recentInvoices,
                monthly,
                statusCounts);
    }

    private static List<MonthlyRevenueDto> mapMonthly(BillingInvoiceAnalyticsJson analytics) {
        if (analytics == null || analytics.monthlyRevenue() == null) {
            return List.of();
        }
        return analytics.monthlyRevenue().stream()
                .map(r -> new MonthlyRevenueDto(r.month(), r.total()))
                .toList();
    }

    private List<RecentInvoiceDto> mapRecentInvoices(JsonPage<BillingInvoiceItemJson> page, String auth) {
        if (page == null || page.items() == null) {
            return List.of();
        }
        List<CompletableFuture<RecentInvoiceDto>> futures = new ArrayList<>();
        for (BillingInvoiceItemJson inv : page.items()) {
            futures.add(CompletableFuture.supplyAsync(() -> toRecentInvoice(inv, auth)));
        }
        return futures.stream().map(CompletableFuture::join).toList();
    }

    private RecentInvoiceDto toRecentInvoice(BillingInvoiceItemJson inv, String auth) {
        UUID id = UUID.fromString(inv.id());
        String name = resolveClientName(auth, inv.personId());
        return new RecentInvoiceDto(
                id, inv.invoiceNumber(), inv.personId(), name, inv.status(), inv.totalTtc(), inv.createdAt());
    }

    private String resolveClientName(String auth, UUID personId) {
        if (personId == null) {
            return "—";
        }
        try {
            CrmPersonItemJson p = getJson(auth, crmBase + "/api/v1/persons/" + personId, CrmPersonItemJson.class);
            String fn = p.firstName() != null ? p.firstName() : "";
            String ln = p.lastName() != null ? p.lastName() : "";
            String n = (fn + " " + ln).trim();
            return n.isEmpty() ? "—" : n;
        } catch (Exception e) {
            return "—";
        }
    }

    private static List<RecentClientDto> mapRecentClients(JsonPage<CrmPersonItemJson> page) {
        if (page == null || page.items() == null) {
            return List.of();
        }
        return page.items().stream()
                .map(p -> new RecentClientDto(
                        UUID.fromString(p.id()),
                        p.firstName(),
                        p.lastName(),
                        p.email(),
                        p.createdAt()))
                .toList();
    }

    private static List<RecentMessageDto> mapRecentMessages(JsonPage<CrmMessageItemJson> page) {
        if (page == null || page.items() == null) {
            return List.of();
        }
        return page.items().stream()
                .map(m -> new RecentMessageDto(
                        UUID.fromString(m.id()),
                        m.firstName(),
                        m.lastName(),
                        m.email(),
                        m.subject(),
                        m.status(),
                        m.source(),
                        m.createdAt()))
                .toList();
    }

    private static String requireBearer(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new DashboardApiException("Non authentifié", HttpStatus.UNAUTHORIZED);
        }
        return authorizationHeader;
    }

    private static String stripTrailingSlash(String url) {
        if (url.endsWith("/")) {
            return url.substring(0, url.length() - 1);
        }
        return url;
    }

    private static <T> CompletableFuture<T> async(Supplier<T> supplier) {
        return CompletableFuture.supplyAsync(supplier);
    }

    private <T> T getJson(String authorization, String url, Class<T> type) {
        try {
            return webClient
                    .get()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, authorization)
                    .retrieve()
                    .bodyToMono(type)
                    .block();
        } catch (WebClientResponseException e) {
            throw new DashboardApiException(
                    "Service distant indisponible: " + e.getStatusCode(), HttpStatus.BAD_GATEWAY);
        }
    }

    private <T> T getJsonPage(String authorization, String url, ParameterizedTypeReference<T> typeRef) {
        try {
            return webClient
                    .get()
                    .uri(url)
                    .header(HttpHeaders.AUTHORIZATION, authorization)
                    .retrieve()
                    .bodyToMono(typeRef)
                    .block();
        } catch (WebClientResponseException e) {
            throw new DashboardApiException(
                    "Service distant indisponible: " + e.getStatusCode(), HttpStatus.BAD_GATEWAY);
        }
    }
}
