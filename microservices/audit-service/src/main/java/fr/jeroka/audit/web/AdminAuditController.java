package fr.jeroka.audit.web;

import fr.jeroka.audit.entity.HistoryLog;
import fr.jeroka.audit.repository.HistoryLogRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/audit")
public class AdminAuditController {

    private final HistoryLogRepository repository;

    public AdminAuditController(HistoryLogRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<HistoryLog> list(@RequestParam String type) {
        return repository.findTop200ByTopicOrderByCreatedAtDesc(type);
    }
}
