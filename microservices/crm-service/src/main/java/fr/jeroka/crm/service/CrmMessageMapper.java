package fr.jeroka.crm.service;

import fr.jeroka.crm.entity.CrmMessageEntity;
import fr.jeroka.crm.web.dto.CreateMessageRequestDto;
import fr.jeroka.crm.web.dto.MessageResponseDto;
import fr.jeroka.crm.web.dto.UpdateMessageRequestDto;

import java.util.UUID;

final class CrmMessageMapper {

    private CrmMessageMapper() {}

    static MessageResponseDto toResponse(CrmMessageEntity m) {
        return new MessageResponseDto(
                m.getId().toString(),
                m.getFirstName(),
                m.getLastName(),
                m.getEmail(),
                m.getPhone(),
                m.getCompany(),
                m.getSubject(),
                m.getMessage(),
                m.getStatus(),
                m.getPriority(),
                m.getSource(),
                m.getPersonId(),
                m.getCreatedAt(),
                m.getReadAt(),
                m.getRepliedAt());
    }

    static CrmMessageEntity toNewEntity(UUID companyId, CreateMessageRequestDto req) {
        var m = new CrmMessageEntity();
        m.setId(UUID.randomUUID());
        m.setCompanyId(companyId);
        m.setFirstName(req.firstName().trim());
        m.setLastName(req.lastName().trim());
        m.setEmail(req.email().trim().toLowerCase());
        m.setPhone(trim(req.phone()));
        m.setCompany(trim(req.company()));
        m.setSubject(req.subject().trim());
        m.setMessage(req.message().trim());
        m.setPriority(req.priority() != null ? req.priority() : "medium");
        m.setSource(req.source() != null ? req.source() : "website");
        return m;
    }

    static void applyUpdate(CrmMessageEntity m, UpdateMessageRequestDto req) {
        if (req.status() != null) {
            m.setStatus(req.status());
        }
        if (req.priority() != null) {
            m.setPriority(req.priority());
        }
    }

    private static String trim(String s) {
        return s != null ? s.trim() : null;
    }
}
