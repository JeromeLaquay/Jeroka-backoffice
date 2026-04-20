package fr.jeroka.crm.service;

import fr.jeroka.crm.entity.CrmPersonEntity;
import fr.jeroka.crm.exception.CrmApiException;
import fr.jeroka.crm.repository.CrmPersonRepository;
import fr.jeroka.crm.web.dto.CreatePersonRequestDto;
import fr.jeroka.crm.web.dto.PageDto;
import fr.jeroka.crm.web.dto.PersonResponseDto;
import fr.jeroka.crm.web.dto.PersonStatsResponseDto;
import fr.jeroka.crm.web.dto.UpdatePersonRequestDto;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
public class CrmPersonService {

    private final CrmPersonRepository persons;

    public CrmPersonService(CrmPersonRepository persons) {
        this.persons = persons;
    }

    @Transactional(readOnly = true)
    public PageDto<PersonResponseDto> list(UUID companyId, int page, int limit) {
        Pageable p = PageRequest.of(Math.max(0, page - 1), Math.min(100, Math.max(1, limit)));
        var result = persons.findByCompanyId(companyId, p);
        var items = result.getContent().stream().map(CrmPersonMapper::toResponse).toList();
        return PageDto.of(items, page, limit, result.getTotalElements());
    }

    @Transactional(readOnly = true)
    public PersonStatsResponseDto stats(UUID companyId) {
        long total = persons.countByCompanyId(companyId);
        long active = persons.countByCompanyIdAndStatus(companyId, "active");
        long inactive = persons.countByCompanyIdAndStatus(companyId, "inactive");
        long prospect = persons.countByCompanyIdAndStatus(companyId, "prospect");
        Instant startOfMonth =
                YearMonth.now(ZoneOffset.UTC).atDay(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        long createdThisMonth = persons.countByCompanyIdAndCreatedAtAfter(companyId, startOfMonth);
        return new PersonStatsResponseDto(total, active, inactive, prospect, createdThisMonth);
    }

    @Transactional(readOnly = true)
    public PersonResponseDto getById(UUID id, UUID companyId) {
        return CrmPersonMapper.toResponse(loadOwned(id, companyId));
    }

    @Transactional
    public PersonResponseDto create(UUID companyId, CreatePersonRequestDto req) {
        if (persons.existsByCompanyIdAndEmail(companyId, req.email().trim().toLowerCase())) {
            throw new CrmApiException(
                    "Une personne existe déjà avec cet email pour cette entreprise", HttpStatus.CONFLICT);
        }
        return CrmPersonMapper.toResponse(persons.save(CrmPersonMapper.toNewEntity(companyId, req)));
    }

    @Transactional
    public PersonResponseDto update(UUID id, UUID companyId, UpdatePersonRequestDto req) {
        CrmPersonEntity p = loadOwned(id, companyId);
        assertEmailChangeAllowed(p, companyId, req);
        CrmPersonMapper.applyUpdate(p, req);
        return CrmPersonMapper.toResponse(persons.save(p));
    }

    @Transactional
    public void delete(UUID id, UUID companyId) {
        loadOwned(id, companyId);
        persons.deleteById(id);
    }

    private void assertEmailChangeAllowed(CrmPersonEntity current, UUID companyId, UpdatePersonRequestDto req) {
        if (req.email() == null) {
            return;
        }
        String next = req.email().trim().toLowerCase();
        if (next.equalsIgnoreCase(current.getEmail())) {
            return;
        }
        if (persons.existsByCompanyIdAndEmail(companyId, next)) {
            throw new CrmApiException(
                    "Une personne existe déjà avec cet email pour cette entreprise", HttpStatus.CONFLICT);
        }
    }

    private CrmPersonEntity loadOwned(UUID id, UUID companyId) {
        return persons.findByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new CrmApiException("Personne introuvable", HttpStatus.NOT_FOUND));
    }
}
