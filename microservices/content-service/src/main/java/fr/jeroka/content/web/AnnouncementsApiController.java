package fr.jeroka.content.web;

import fr.jeroka.content.web.dto.announcement.AnnouncementListDto;
import fr.jeroka.content.web.dto.announcement.AnnouncementResponse;
import fr.jeroka.content.web.dto.announcement.CreateAnnouncementRequest;
import fr.jeroka.content.web.dto.announcement.CreateAnnouncementResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Liste vide + création stub (aligné core). */
@RestController
@RequestMapping("/api/v1/announcements")
public class AnnouncementsApiController {

    @GetMapping
    public AnnouncementListDto list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority) {
        return AnnouncementListDto.empty();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CreateAnnouncementResponse create(
            @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateAnnouncementRequest request) {
        var now = Instant.now().toString();
        String authorId = jwt != null ? jwt.getSubject() : "system";
        String authorName = jwt != null ? claimEmail(jwt) : "Système";
        String authorEmail = jwt != null ? claimEmail(jwt) : "";
        var ann = new AnnouncementResponse(
                UUID.randomUUID().toString(),
                request.title(),
                request.summary(),
                request.content(),
                request.type(),
                request.priority(),
                request.status(),
                request.version(),
                request.targetAudience() != null ? request.targetAudience() : List.of(),
                request.isPinned(),
                request.sendNotification(),
                0,
                now,
                now,
                request.scheduledAt(),
                "published".equals(request.status()) ? now : null,
                new AnnouncementResponse.AuthorInfo(authorId, authorName, authorEmail));
        return new CreateAnnouncementResponse(true, ann);
    }

    private static String claimEmail(Jwt jwt) {
        String e = jwt.getClaimAsString("email");
        return e != null ? e : "";
    }
}
