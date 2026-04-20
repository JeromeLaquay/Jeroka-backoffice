package fr.jeroka.crm.service;

import fr.jeroka.crm.entity.CrmMessageEntity;
import fr.jeroka.crm.exception.CrmApiException;
import fr.jeroka.crm.repository.CrmMessageRepository;
import fr.jeroka.crm.web.dto.CreateMessageRequestDto;
import fr.jeroka.crm.web.dto.MessageResponseDto;
import fr.jeroka.crm.web.dto.MessageStatsResponseDto;
import fr.jeroka.crm.web.dto.PageDto;
import fr.jeroka.crm.web.dto.UpdateMessageRequestDto;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class CrmMessageService {

    private final CrmMessageRepository messages;

    public CrmMessageService(CrmMessageRepository messages) {
        this.messages = messages;
    }

    @Transactional(readOnly = true)
    public PageDto<MessageResponseDto> list(UUID companyId, int page, int limit) {
        Pageable p = PageRequest.of(Math.max(0, page - 1), Math.min(100, Math.max(1, limit)));
        var result = messages.findByCompanyIdOrderByCreatedAtDesc(companyId, p);
        var items = result.getContent().stream().map(CrmMessageMapper::toResponse).toList();
        return PageDto.of(items, page, limit, result.getTotalElements());
    }

    @Transactional(readOnly = true)
    public MessageStatsResponseDto stats(UUID companyId) {
        Instant now = Instant.now();
        Instant startOfDay = now.truncatedTo(ChronoUnit.DAYS);
        Instant weekAgo = now.minus(7, ChronoUnit.DAYS);
        Instant monthAgo = now.minus(30, ChronoUnit.DAYS);
        return new MessageStatsResponseDto(
                messages.countByCompanyId(companyId),
                messages.countByCompanyIdAndStatus(companyId, "new"),
                messages.countByCompanyIdAndStatus(companyId, "read"),
                messages.countByCompanyIdAndStatus(companyId, "replied"),
                messages.countByCompanyIdAndStatus(companyId, "archived"),
                messages.countByCompanyIdAndCreatedAtAfter(companyId, startOfDay),
                messages.countByCompanyIdAndCreatedAtAfter(companyId, weekAgo),
                messages.countByCompanyIdAndCreatedAtAfter(companyId, monthAgo));
    }

    @Transactional(readOnly = true)
    public MessageResponseDto getById(UUID id, UUID companyId) {
        return CrmMessageMapper.toResponse(loadOwned(id, companyId));
    }

    @Transactional
    public MessageResponseDto create(UUID companyId, CreateMessageRequestDto req) {
        return CrmMessageMapper.toResponse(messages.save(CrmMessageMapper.toNewEntity(companyId, req)));
    }

    @Transactional
    public MessageResponseDto update(UUID id, UUID companyId, UpdateMessageRequestDto req) {
        CrmMessageEntity m = loadOwned(id, companyId);
        CrmMessageMapper.applyUpdate(m, req);
        return CrmMessageMapper.toResponse(messages.save(m));
    }

    @Transactional
    public void delete(UUID id, UUID companyId) {
        loadOwned(id, companyId);
        messages.deleteById(id);
    }

    @Transactional
    public MessageResponseDto markAsRead(UUID id, UUID companyId) {
        CrmMessageEntity msg = loadOwned(id, companyId);
        if (msg.getReadAt() == null) {
            msg.setReadAt(Instant.now());
            return CrmMessageMapper.toResponse(messages.save(msg));
        }
        return CrmMessageMapper.toResponse(msg);
    }

    @Transactional(readOnly = true)
    public CrmMessageEntity loadForAi(UUID id, UUID companyId) {
        return loadOwned(id, companyId);
    }

    private CrmMessageEntity loadOwned(UUID id, UUID companyId) {
        return messages.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new CrmApiException("Message introuvable", HttpStatus.NOT_FOUND));
    }
}
