package fr.jeroka.emailservice.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "email_sync_jobs", indexes = {
        @Index(name = "idx_email_sync_jobs_user_id", columnList = "user_id"),
        @Index(name = "idx_email_sync_jobs_status", columnList = "status")
})
public class EmailSyncJob {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 32)
    private String status;

    @Column(name = "requested_at", nullable = false)
    private Instant requestedAt = Instant.now();

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(length = 32)
    private String mode;

    @Column(name = "count_limit")
    private Integer countLimit;

    @Column(name = "date_from", length = 32)
    private String dateFrom;

    @Column(name = "date_to", length = 32)
    private String dateTo;

    @Column(name = "include_attachments")
    private Boolean includeAttachments;

    @Column(name = "auto_analyze")
    private Boolean autoAnalyze;

    @Column(name = "new_emails")
    private Integer newEmails;

    @Column(name = "downloaded_attachments")
    private Integer downloadedAttachments;

    @Column(name = "unique_senders")
    private Integer uniqueSenders;

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getRequestedAt() { return requestedAt; }
    public void setRequestedAt(Instant requestedAt) { this.requestedAt = requestedAt; }
    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public Integer getCountLimit() { return countLimit; }
    public void setCountLimit(Integer countLimit) { this.countLimit = countLimit; }
    public String getDateFrom() { return dateFrom; }
    public void setDateFrom(String dateFrom) { this.dateFrom = dateFrom; }
    public String getDateTo() { return dateTo; }
    public void setDateTo(String dateTo) { this.dateTo = dateTo; }
    public Boolean getIncludeAttachments() { return includeAttachments; }
    public void setIncludeAttachments(Boolean includeAttachments) { this.includeAttachments = includeAttachments; }
    public Boolean getAutoAnalyze() { return autoAnalyze; }
    public void setAutoAnalyze(Boolean autoAnalyze) { this.autoAnalyze = autoAnalyze; }
    public Integer getNewEmails() { return newEmails; }
    public void setNewEmails(Integer newEmails) { this.newEmails = newEmails; }
    public Integer getDownloadedAttachments() { return downloadedAttachments; }
    public void setDownloadedAttachments(Integer downloadedAttachments) { this.downloadedAttachments = downloadedAttachments; }
    public Integer getUniqueSenders() { return uniqueSenders; }
    public void setUniqueSenders(Integer uniqueSenders) { this.uniqueSenders = uniqueSenders; }
}

