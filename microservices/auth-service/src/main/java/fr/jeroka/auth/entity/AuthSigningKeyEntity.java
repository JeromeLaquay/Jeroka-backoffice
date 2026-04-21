package fr.jeroka.auth.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "auth_signing_keys")
public class AuthSigningKeyEntity {

    @Id
    private String kid;

    @Column(name = "public_pem", nullable = false, columnDefinition = "text")
    private String publicPem;

    @Column(name = "private_pem", nullable = false, columnDefinition = "text")
    private String privatePem;

    @Column(nullable = false)
    private String status;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    public String getKid() {
        return kid;
    }

    public void setKid(String kid) {
        this.kid = kid;
    }

    public String getPublicPem() {
        return publicPem;
    }

    public void setPublicPem(String publicPem) {
        this.publicPem = publicPem;
    }

    public String getPrivatePem() {
        return privatePem;
    }

    public void setPrivatePem(String privatePem) {
        this.privatePem = privatePem;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
