package fr.jeroka.apijava.entity;

import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "email_label_preferences", indexes = {
        @Index(name = "idx_email_label_preferences_user_id", columnList = "user_id"),
        @Index(name = "idx_email_label_preferences_label_id", columnList = "label_id")
})
public class EmailLabelPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "label_id", nullable = false, length = 255)
    private String labelId;

    @Column(name = "download_attachments", nullable = false)
    private boolean downloadAttachments = true;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getLabelId() { return labelId; }
    public void setLabelId(String labelId) { this.labelId = labelId; }
    public boolean isDownloadAttachments() { return downloadAttachments; }
    public void setDownloadAttachments(boolean downloadAttachments) { this.downloadAttachments = downloadAttachments; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

