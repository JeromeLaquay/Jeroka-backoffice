package fr.jeroka.apijava.service;

import fr.jeroka.apijava.dto.admin.AdminCompanyResponse;
import fr.jeroka.apijava.dto.admin.CreateCompanyRequest;
import fr.jeroka.apijava.entity.Company;
import fr.jeroka.apijava.repository.CompanyRepository;
import fr.jeroka.apijava.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminCompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public AdminCompanyService(CompanyRepository companyRepository, UserRepository userRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
    }

    public PageResult list(String search, String status, int page, int limit, String sortBy, String sortOrder) {
        String sortProperty = mapSortProperty(sortBy);
        Sort.Direction direction = "asc".equalsIgnoreCase(sortOrder) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(Math.max(0, page - 1), Math.min(50, Math.max(1, limit)), Sort.by(direction, sortProperty));

        Page<Company> companyPage = (search != null && !search.isBlank())
                ? companyRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(search.trim(), search.trim(), pageable)
                : companyRepository.findAll(pageable);

        List<AdminCompanyResponse> items = companyPage.getContent().stream()
                .map(c -> toResponse(c))
                .toList();

        return new PageResult(
                items,
                companyPage.getNumber() + 1,
                limit,
                companyPage.getTotalElements(),
                (int) Math.ceil((double) companyPage.getTotalElements() / limit)
        );
    }

    private static String mapSortProperty(String sortBy) {
        if (sortBy == null || sortBy.isBlank()) return "createdAt";
        return switch (sortBy) {
            case "name" -> "name";
            case "subscription_plan" -> "subscriptionPlan";
            case "created_at" -> "createdAt";
            default -> "createdAt";
        };
    }

    private AdminCompanyResponse toResponse(Company c) {
        long userCount = userRepository.countByCompanyId(c.getId());
        return new AdminCompanyResponse(
                c.getId().toString(),
                c.getName(),
                c.getEmail(),
                c.getPhone(),
                c.getAddressLine1(),
                c.getAddressLine2(),
                c.getCity(),
                c.getPostalCode(),
                c.getCountry(),
                c.getSiret(),
                c.getVatNumber(),
                true,
                c.getSubscriptionPlan(),
                c.getCreatedAt() != null ? c.getCreatedAt().toString() : null,
                c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : null,
                userCount
        );
    }

    public AdminCompanyResponse create(CreateCompanyRequest req) {
        String name = req.name() != null ? req.name().trim() : "";
        String email = req.email() != null ? req.email().trim().toLowerCase() : "";
        if (name.isBlank() || email.isBlank()) {
            throw new IllegalArgumentException("Nom et email obligatoires");
        }
        Company c = new Company();
        c.setName(name);
        c.setLegalName(name);
        c.setEmail(email);
        c.setPhone(trim(req.phone()));
        c.setAddressLine1(trim(req.address_line1()));
        c.setAddressLine2(trim(req.address_line2()));
        c.setCity(trim(req.city()));
        c.setPostalCode(trim(req.postal_code()));
        c.setCountry(trim(req.country()));
        c.setVatNumber(vatNumberToString(req.vat_number()));
        c.setSiret(trim(req.siret()));
        c.setSubscriptionPlan(trim(req.subscription_plan()));
        c = companyRepository.save(c);
        return toResponse(c);
    }

    private static String trim(String s) {
        return s != null && !s.isBlank() ? s.trim() : null;
    }

    private static String vatNumberToString(Object v) {
        if (v == null) return null;
        if (v instanceof String s) return s.isBlank() ? null : s.trim();
        return String.valueOf(v);
    }

    public record PageResult(
            List<AdminCompanyResponse> data,
            int page,
            int limit,
            long total,
            int totalPages
    ) {}
}
