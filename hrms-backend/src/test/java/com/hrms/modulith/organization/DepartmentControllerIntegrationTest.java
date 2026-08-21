// package com.hrms.modulith.organization;

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
// public class DepartmentControllerIntegrationTest {

//     @Autowired
//     private MockMvc mockMvc;

//     @Autowired
//     private ObjectMapper objectMapper;

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
//     @DisplayName("1. COMPANY_ADMIN can create a department which automatically binds to their own company")
//     void testCompanyAdminCreatesDepartment() throws Exception {
//         String token = loginAndGetToken("jitendra@hrms.internal", "admin123");

//         String deptPayload = """
//                 {
//                     "name": "Cloud DevOps & Platform",
//                     "code": "DEVOPS",
//                     "headOfDepartment": "Jitendra Shukla",
//                     "color": "#0ea5e9"
//                 }
//                 """;

//         MvcResult result = mockMvc.perform(post("/api/v1/departments")
//                         .header("Authorization", "Bearer " + token)
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .content(deptPayload))
//                 .andExpect(status().isCreated())
//                 .andExpect(jsonPath("$.success").value(true))
//                 .andExpect(jsonPath("$.data.name").value("Cloud DevOps & Platform"))
//                 .andExpect(jsonPath("$.data.code").value("DEVOPS"))
//                 .andExpect(jsonPath("$.data.headOfDepartment").value("Jitendra Shukla"))
//                 .andReturn();

//         JsonNode json = objectMapper.readTree(result.getResponse().getContentAsString());
//         String companyId = json.path("data").path("companyId").asText();
//         assertThat(companyId).isNotBlank();
//     }

//     @Test
//     @DisplayName("2. COMPANY_ADMIN only receives departments belonging to their own company")
//     void testCompanyAdminGetsOwnDepartments() throws Exception {
//         String token = loginAndGetToken("jitendra@hrms.internal", "admin123");

//         mockMvc.perform(get("/api/v1/departments")
//                         .header("Authorization", "Bearer " + token))
//                 .andExpect(status().isOk())
//                 .andExpect(jsonPath("$.success").value(true))
//                 .andExpect(jsonPath("$.data").isArray())
//                 .andExpect(jsonPath("$.data.length()").value(org.hamcrest.Matchers.greaterThan(0)));
//     }

//     @Test
//     @DisplayName("3. COMPANY_ADMIN cannot forge and create department for a different company ID")
//     void testCompanyAdminCannotCreateForForeignCompany() throws Exception {
//         String token = loginAndGetToken("jitendra@hrms.internal", "admin123");

//         String fraudulentPayload = """
//                 {
//                     "companyId": "FOREIGN_UNAUTHORIZED_COMPANY_ID",
//                     "name": "Unauthorized Ext Dept",
//                     "code": "EXT-DEPT",
//                     "headOfDepartment": "Unknown",
//                     "color": "#f43f5e"
//                 }
//                 """;

//         mockMvc.perform(post("/api/v1/departments")
//                         .header("Authorization", "Bearer " + token)
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .content(fraudulentPayload))
//                 .andExpect(status().isBadRequest())
//                 .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Access denied")));
//     }

//     @Test
//     @DisplayName("4. Normal EMPLOYEE cannot add departments")
//     void testEmployeeCannotCreateDepartment() throws Exception {
//         String token = loginAndGetToken("alex@hrms.internal", "employee123");

//         String deptPayload = """
//                 {
//                     "name": "Employee Custom Dept",
//                     "code": "EMP-DEPT"
//                 }
//                 """;

//         mockMvc.perform(post("/api/v1/departments")
//                         .header("Authorization", "Bearer " + token)
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .content(deptPayload))
//                 .andExpect(status().isBadRequest())
//                 .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Access denied")));
//     }

//     @Test
//     @DisplayName("5. SUPER_ADMIN can create department across any company")
//     void testSuperAdminCanCreateDepartment() throws Exception {
//         String token = loginAndGetToken("admin@hrms.internal", "admin123");

//         String deptPayload = """
//                 {
//                     "name": "Executive Governance",
//                     "code": "GOV",
//                     "headOfDepartment": "Board of Directors",
//                     "color": "#8b5cf6"
//                 }
//                 """;

//         mockMvc.perform(post("/api/v1/departments")
//                         .header("Authorization", "Bearer " + token)
//                         .contentType(MediaType.APPLICATION_JSON)
//                         .content(deptPayload))
//                 .andExpect(status().isCreated())
//                 .andExpect(jsonPath("$.success").value(true))
//                 .andExpect(jsonPath("$.data.name").value("Executive Governance"))
//                 .andExpect(jsonPath("$.data.code").value("GOV"));
//     }
// }
