package com.hrms.modulith.common.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private final String id;
    private final String email;
    private final String password;
    private final String name;
    private final String role;
    private final String companyId;
    private final String companyName;
    private final String department;
    private final String designation;
    private final Collection<? extends GrantedAuthority> authorities;

    public static UserPrincipal create(String id, String email, String password, String name,
                                       String role, String companyId, String companyName,
                                       String department, String designation) {
        return create(id, email, password, name, role, companyId, companyName, department, designation, List.of());
        }

        public static UserPrincipal create(String id, String email, String password, String name,
                           String role, String companyId, String companyName,
                                       String department, String designation, List<String> additionalRoles) {
        List<String> roleNames = new java.util.ArrayList<>();
        roleNames.add(role);
        roleNames.addAll(additionalRoles);
        List<GrantedAuthority> allAuthorities = roleNames.stream().distinct()
            .map(value -> (GrantedAuthority) new SimpleGrantedAuthority("ROLE_" + value.replace(" ", "_").toUpperCase()))
            .toList();
        return UserPrincipal.builder()
                .id(id)
                .email(email)
                .password(password)
                .name(name)
                .role(role)
                .companyId(companyId)
                .companyName(companyName)
                .department(department)
                .designation(designation)
                .authorities(allAuthorities)
                .build();
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
