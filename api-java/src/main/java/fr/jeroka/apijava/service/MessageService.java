package fr.jeroka.apijava.service;

import fr.jeroka.apijava.entity.Message;
import fr.jeroka.apijava.exception.ApiException;
import fr.jeroka.apijava.repository.MessageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class MessageService {

    private final MessageRepository messageRepository;

    public MessageService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public Page<Message> findByCompanyId(UUID companyId, int page, int limit) {
        Pageable p = PageRequest.of(Math.max(0, page - 1), Math.min(100, Math.max(1, limit)));
        return messageRepository.findByCompanyIdOrderByCreatedAtDesc(companyId, p);
    }

    public Message getByIdAndCompanyId(UUID id, UUID companyId) {
        return messageRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ApiException("Message introuvable", HttpStatus.NOT_FOUND));
    }

    @Transactional
    public Message create(Message message) {
        return messageRepository.save(message);
    }

    @Transactional
    public Message update(Message message) {
        return messageRepository.save(message);
    }

    @Transactional
    public void delete(UUID id, UUID companyId) {
        messageRepository.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new ApiException("Message introuvable", HttpStatus.NOT_FOUND));
        messageRepository.deleteById(id);
    }

    @Transactional
    public Message markAsRead(UUID id, UUID companyId) {
        var msg = getByIdAndCompanyId(id, companyId);
        if (msg.getReadAt() == null) {
            msg.setReadAt(Instant.now());
            return messageRepository.save(msg);
        }
        return msg;
    }

    public long countByCompanyId(UUID companyId) {
        return messageRepository.countByCompanyId(companyId);
    }

    public long countByCompanyIdAndStatus(UUID companyId, String status) {
        return messageRepository.countByCompanyIdAndStatus(companyId, status);
    }

    public long countByCompanyIdAndCreatedAtAfter(UUID companyId, Instant after) {
        return messageRepository.countByCompanyIdAndCreatedAtAfter(companyId, after);
    }
}
