// package com.hrms.modulith.iam;

// import com.fasterxml.jackson.databind.JsonNode;
// import com.fasterxml.jackson.databind.ObjectMapper;
// import org.junit.jupiter.api.DisplayName;
// import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
// import org.springframework.boot.test.context.SpringBootTest;
// import org.springframework.http.MediaType;
// import org.springframework.test.web.servlet.MockMvc;
// import org.springframework.test.web.servlet.MvcResult;

// import static org.assertj.core.api.Assertions.assertThat;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// @SpringBootTest
// @AutoConfigureMockMvc
// public class UserControllerTest {

//     @Autowired
//     private MockMvc mockMvc;

//     @Autowired
//     private ObjectMapper objectMapper;

//     @Autowired
//     private UserAccountRepository userRepository;

//     private String loginAndGetToken(String email, String password) throws Exception {
//         String loginPayload = String.format("{\"email\":\"%s\",\"password\":\"%s\"}", email, password);

//         MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .content(loginPayload))
//                 .andExpect(status().isOk())
//                 .andReturn();

//         JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
//         return root.path("data").path("token").asText();
//     }

//     @Test
//     @DisplayName("1. Get dynamic menu features for specific user by ID")
//     void testGetFeaturesByUserId() throws Exception {
//         String token = loginAndGetToken("jitendra@hrms.internal", "admin123");

//         UserAccount jitendra = userRepository.findByEmail("jitendra@hrms.internal").orElseThrow();
//         String userId = jitendra.getId();

//         MvcResult result = mockMvc.perform(get("/api/v1/users/" + userId + "/features")
//                         .header("Authorization", "Bearer " + token))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.success").value(true))
//                 .andExpect(jsonPath("$.data.userId").value(userId))
//                 .andExpect(jsonPath("$.data.role").value("Company Admin"))
//                 .andExpect(jsonPath("$.data.features").isArray())
//                 .andReturn();

//         JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
//         JsonNode features = json.path("data").path("features");
//         assertThat(features.size()).isGreaterThanOrEqualTo(6);

//         // Verify key modules are present
//         boolean hasDashboard = false;
//         boolean hasEmployees = false;
//         boolean hasPayroll = false;
//         boolean hasCompanies = false;

//         for (JsonNode f : features) {
//             String code = f.path("code").asText();
//             if ("DASHBOARD".equals(code)) hasDashboard = true;
//             if ("EMPLOYEES".equals(code)) hasEmployees = true;
//             if ("PAYROLL".equals(code)) hasPayroll = true;
//             if ("COMPANIES".equals(code)) hasCompanies = true;
//         }

//         assertThat(hasDashboard).isTrue();
//         assertThat(hasEmployees).isTrue();
//         assertThat(hasPayroll).isTrue();
//         // Company Admin does not get multi-company entity management module
//         assertThat(hasCompanies).isFalse();
//     }

//     @Test
//     @DisplayName("2. Super Admin gets enterprise governance (Companies module)")
//     void testSuperAdminFeatures() throws Exception {
//         String token = loginAndGetToken("admin@hrms.internal", "admin123");

//         UserAccount admin = userRepository.findByEmail("admin@hrms.internal").orElseThrow();
//         String userId = admin.getId();

//         MvcResult result = mockMvc.perform(get("/api/v1/users/" + userId + "/features")
//                         .header("Authorization", "Bearer " + token))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.data.role").value("Super Admin"))
//                 .andReturn();

//         JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
//         JsonNode features = json.path("data").path("features");

//         boolean hasCompanies = false;
//         for (JsonNode f : features) {
//             if ("COMPANIES".equals(f.path("code").asText())) {
//                 hasCompanies = true;
//                 break;
//             }
//         }
//         assertThat(hasCompanies).isTrue();
//     }

//     @Test
//     @DisplayName("3. Get dynamic menu features for current session via /api/v1/users/me/features")
//     void testGetCurrentUserFeatures() throws Exception {
//         String token = loginAndGetToken("alex@hrms.internal", "employee123");

//         mockMvc.perform(get("/api/v1/users/me/features")
//                         .header("Authorization", "Bearer " + token))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.success").value(true))
//                 .andExpect(jsonPath("$.data.email").value("alex@hrms.internal"))
//                 .andExpect(jsonPath("$.data.role").value("Employee"));
//     }
// }
