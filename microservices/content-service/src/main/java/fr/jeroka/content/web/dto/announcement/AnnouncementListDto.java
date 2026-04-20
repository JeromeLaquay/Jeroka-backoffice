package fr.jeroka.content.web.dto.announcement;

import java.util.List;

public record AnnouncementListDto(boolean success, List<AnnouncementResponse> data) {

    public static AnnouncementListDto empty() {
        return new AnnouncementListDto(true, List.of());
    }
}
