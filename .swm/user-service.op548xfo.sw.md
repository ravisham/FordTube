---
title: User Service
---
# Introduction

This document will walk you through the implementation of the User Service in the <SwmToken path="/FordTube.WebApi/Services/UserService.cs" pos="12:8:8" line-data="using OneMagnify.Data.Ford.FordTube.Entities;">`FordTube`</SwmToken> Web API. The User Service is responsible for handling <SwmToken path="/FordTube.WebApi/Services/UserService.cs" pos="20:9:11" line-data="    /// Provides methods for user-related operations and token validation.">`user-related`</SwmToken> operations, including user creation, retrieval, and authentication.

We will cover:

1. How the <SwmToken path="/FordTube.WebApi/Services/UserService.cs" pos="22:5:5" line-data="    public class UserService">`UserService`</SwmToken> is initialized and its dependencies.
2. The process of retrieving or creating a user based on claims.
3. How user roles and types are determined.
4. The method for signing in a user.
5. How the service determines the user's franchise.

# Initialization of <SwmToken path="/FordTube.WebApi/Services/UserService.cs" pos="22:5:5" line-data="    public class UserService">`UserService`</SwmToken>

<SwmSnippet path="/FordTube.WebApi/Services/UserService.cs" line="12">

---

The <SwmToken path="/FordTube.WebApi/Services/UserService.cs" pos="22:5:5" line-data="    public class UserService">`UserService`</SwmToken> is initialized with several dependencies that are crucial for its operations, such as repositories and settings. This setup allows the service to interact with the database and handle logging and HTTP context.

```
using OneMagnify.Data.Ford.FordTube.Entities;
using OneMagnify.Data.Ford.FordTube.Entities.Enums;
using OneMagnify.Data.Ford.FordTube.Repositories;
using OneMagnify.Ford.EntityInfo.Data.Repositories.Interfaces;

namespace FordTube.WebApi.Services
{
    /// <summary>
    /// Provides methods for user-related operations and token validation.
    /// </summary>
    public class UserService
    {
        private readonly IUserRepository _userRepository;
        private readonly JwtSettings _jwtSettings;
        private readonly ILogger<UserService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IGoldDRepository _goldDRepository;

        public UserService(IUserRepository userRepository, JwtSettings jwtSettings, ILogger<UserService> logger, IHttpContextAccessor httpContextAccessor, IGoldDRepository goldDRepository)
        {
            _userRepository = userRepository;
            _jwtSettings = jwtSettings;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _goldDRepository = goldDRepository;
        }
```

---

</SwmSnippet>

# Retrieving or creating a user

<SwmSnippet path="/FordTube.WebApi/Services/UserService.cs" line="39">

---

The <SwmToken path="/FordTube.WebApi/Services/UserService.cs" pos="45:10:10" line-data="        public async Task&lt;JwtUser&gt; GetOrCreateUserAsync(IEnumerable&lt;Claim&gt; claims)">`GetOrCreateUserAsync`</SwmToken> method is central to the <SwmToken path="/FordTube.WebApi/Services/UserService.cs" pos="22:5:5" line-data="    public class UserService">`UserService`</SwmToken>. It retrieves or creates a user based on claims. If the user exists, it updates their details if necessary. This ensures that user information is always current.

```
        /// <summary>
        /// Retrieves or creates a user based on the claims. 
        /// If the user exists, updates their details if necessary.
        /// </summary>
        /// <param name="claims">The claims to use for retrieving or creating the user.</param>
        /// <returns>The retrieved or created user.</returns>
        public async Task<JwtUser> GetOrCreateUserAsync(IEnumerable<Claim> claims)
        {
            var enumerableClaims = claims as Claim[] ?? claims.ToArray();

            var userName = enumerableClaims.FirstOrDefault(c => c.Type == "uid")?.Value;
            var emailAddress = $"{userName}@ford.com";
            var firstName = enumerableClaims.FirstOrDefault(c => c.Type == "givenName")?.Value;
            var lastName = enumerableClaims.FirstOrDefault(c => c.Type == "sn")?.Value;
            var starsId = enumerableClaims.FirstOrDefault(c => c.Type == "StarsId")?.Value;
            var pnaCode = enumerableClaims.FirstOrDefault(c => c.Type == "fordSiteCode")?.Value;
            var userTypeClaim = enumerableClaims.FirstOrDefault(c => c.Type == "fordUserType")?.Value;

            if (userTypeClaim?.ToLower() == "employee")
            {
                userTypeClaim = "NONOVVM";
            }
            var userType = userTypeClaim != null
                ? EnumExtensions.GetValueFromDescription(userTypeClaim.ToUpperInvariant(), UserTypeEnum.DEALER)
                : UserTypeEnum.DEALER;

            // Ensure the role is not set to super_admin or dealer_admin
            var userRole = UserRoleEnum.DEALER;
            var userRoleClaim = enumerableClaims.FirstOrDefault(c => c.Type == "userRole")?.Value;

            if (!string.IsNullOrEmpty(userRoleClaim) && Enum.TryParse(userRoleClaim, true, out UserRoleEnum parsedUserRole))
            {
                if (parsedUserRole != UserRoleEnum.SUPER_ADMIN && parsedUserRole != UserRoleEnum.DEALER_ADMIN)
                {
                    userRole = parsedUserRole;
                }
                else
                {
                    // Log the attempt and handle accordingly
                    _logger.LogWarning("Attempt to create user with super_admin, dealer_admin role.");
                }
            }

            if (userTypeClaim?.ToLower() != "dealer")
            {
                userRole = UserRoleEnum.SUPER_USER;
            }
```

---

</SwmSnippet>

# User role and type determination

<SwmSnippet path="/FordTube.WebApi/Services/UserService.cs" line="87">

---

The service determines the user's role and type based on claims. It ensures that certain roles, like <SwmToken path="/FordTube.WebApi/Services/UserService.cs" pos="65:17:17" line-data="            // Ensure the role is not set to super_admin or dealer_admin">`super_admin`</SwmToken>, are not assigned inappropriately. This logic is crucial for maintaining proper access control.

```
            // Get user by UserName only
            var existingUser = await _userRepository.FindByUserNameAsync(userName);

            JwtUser user;
            if (existingUser != null)
            {
                // If user exists, check if any updates are needed
                var isUpdated = false;

                if (!existingUser.FirstName.Equals(firstName, StringComparison.InvariantCultureIgnoreCase))
                {
                    existingUser.FirstName = firstName;
                    isUpdated = true;
                }

                if (!existingUser.LastName.Equals(lastName, StringComparison.InvariantCultureIgnoreCase))
                {
                    existingUser.LastName = lastName;
                    isUpdated = true;
                }

                if (!existingUser.PnaCode.Equals(pnaCode, StringComparison.InvariantCultureIgnoreCase))
                {
                    existingUser.PnaCode = pnaCode;
                    isUpdated = true;
                }

                if (isUpdated)
                {
                    // Use the UpdateAsync method to update the user in the database
                    await _userRepository.UpdateAsync(existingUser, existingUser.Id);
                }

                user = new JwtUser
                {
                    DealerId = existingUser.DealerId,
                    UserName = existingUser.UserName,
                    EmailAddress = existingUser.EmailAddress,
                    FirstName = existingUser.FirstName,
                    StarsId = existingUser.StarsId,
                    LastName = existingUser.LastName,
                    PnaCode = existingUser.PnaCode,
                    UserTypeId = existingUser.UserTypeId,
                    UserRoleId = existingUser.UserRoleId,
                    Franchise = FranchiseType.Both // Default to Both if not a dealer
                };
            }
            else
            {
                // If user does not exist, create a new one
                user = new JwtUser
                {
                    DealerId = 0,
                    UserName = userName,
                    EmailAddress = emailAddress,
                    FirstName = firstName,
                    StarsId = starsId,
                    LastName = lastName,
                    PnaCode = pnaCode,
                    UserTypeId = (int)userType,
                    UserRoleId = (int)userRole,
                    Franchise = FranchiseType.Both // Default to Both if not a dealer
                };

                // Special handling for specific PNA codes
                var specialPnaCodes = new List<string> { "FNAMR", "IT", "MKS", "RETHQ", "FAPAC" };
                if (specialPnaCodes.Contains(user.PnaCode))
                {
                    user.FirstName = "Ford";
                    user.LastName = "User";
                }

                // Add the new user to the database
                await _userRepository.AddAsync(new User
                {
                    UserName = userName,
                    EmailAddress = emailAddress,
                    FirstName = firstName,
                    LastName = lastName,
                    StarsId = starsId,
                    PnaCode = pnaCode,
                    UserTypeId = (int)userType,
                    UserRoleId = (int)userRole,
                });
            }

            // Determine the user's franchise based on PnaCode
            if (await IsFordDealer(user.PnaCode))
            {
                user.Franchise = FranchiseType.Ford;
            }
            else if (await IsLincolnDealer(user.PnaCode))
            {
                user.Franchise = FranchiseType.Lincoln;
            }
            else if (await IsDualDealer(user.PnaCode))
            {
                user.Franchise = FranchiseType.Both;
            }
```

---

</SwmSnippet>

# Signing in a user

<SwmSnippet path="/FordTube.WebApi/Services/UserService.cs" line="191">

---

The <SwmToken path="/FordTube.WebApi/Services/UserService.cs" pos="196:7:7" line-data="        public async Task SignInUserAsync(IEnumerable&lt;Claim&gt; claims)">`SignInUserAsync`</SwmToken> method handles user authentication by signing in the user with the provided claims. It uses cookie authentication to manage user sessions.

```
        /// <summary>
        /// Signs in the user using the provided claims.
        /// </summary>
        /// <param name="claims">The claims to include in the user identity.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        public async Task SignInUserAsync(IEnumerable<Claim> claims)
        {
            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties { IsPersistent = true };

            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
            {
                _logger.LogError("HTTP context is not available.");
                throw new InvalidOperationException("HTTP context is not available.");
            }

            await httpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);
        }
```

---

</SwmSnippet>

# Determining user's franchise

<SwmSnippet path="/FordTube.WebApi/Services/UserService.cs" line="211">

---

The service determines the user's franchise based on their PNA code. This is important for categorizing users correctly within the system.

```
        /// <summary>
        /// Retrieves a user based on provided claims.
        /// </summary>
        /// <param name="userName">The username.</param>
        /// <param name="emailAddress">The email address.</param>
        /// <param name="firstName">The first name.</param>
        /// <param name="lastName">The last name.</param>
        /// <param name="pnaCode">The PNA code.</param>
        /// <returns>The corresponding user, if found.</returns>
        public async Task<JwtUser> GetUserByClaimsAsync(string userName, string emailAddress, string firstName, string lastName, string pnaCode)
        {
            var user = await _userRepository.FindAsync(u => u.UserName == userName && u.EmailAddress == emailAddress && u.FirstName == firstName && u.LastName == lastName && u.PnaCode == pnaCode);

            if (user == null) return null;

            var jwtUser = new JwtUser
            {
                UserName = user.UserName,
                EmailAddress = user.EmailAddress,
                FirstName = user.FirstName,
                LastName = user.LastName,
                PnaCode = user.PnaCode,
                UserTypeId = user.UserTypeId,
                UserRoleId = user.UserRoleId,
                Franchise = FranchiseType.Both // Default to Both
            };

            // Determine the user's franchise
            if (await IsFordDealer(user.PnaCode))
            {
                jwtUser.Franchise = FranchiseType.Ford;
            }
            else if (await IsLincolnDealer(user.PnaCode))
            {
                jwtUser.Franchise = FranchiseType.Lincoln;
            }
            else if (await IsDualDealer(user.PnaCode))
            {
                jwtUser.Franchise = FranchiseType.Both;
            }

            return jwtUser;
        }
```

---

</SwmSnippet>

# Additional utility methods

<SwmSnippet path="/FordTube.WebApi/Services/UserService.cs" line="255">

---

The <SwmToken path="/FordTube.WebApi/Services/UserService.cs" pos="22:5:5" line-data="    public class UserService">`UserService`</SwmToken> includes utility methods for decoding tokens and determining dealership status. These methods support the main operations by providing necessary checks and transformations.

```
        /// <summary>
        /// Decodes the access token without validation.
        /// </summary>
        /// <param name="accessToken">The access token.</param>
        /// <returns>The decoded claims principal.</returns>
        public ClaimsPrincipal DecodeAccessTokenWithoutValidation(string accessToken)
        {
            var handler = new JwtSecurityTokenHandler();
            var jwtToken = handler.ReadJwtToken(accessToken);
            var identity = new ClaimsIdentity(jwtToken.Claims, "jwt");
            return new ClaimsPrincipal(identity);
        }

        /// <summary>
        /// Determines if a user is a Ford dealer based on their PNA code.
        /// </summary>
        /// <param name="paCode">The PNA code.</param>
        /// <returns>True if the user is a Ford dealer; otherwise, false.</returns>
        public async Task<bool> IsFordDealer(string paCode)
        {
            var dealers = await _goldDRepository.FindByAsync(d => d.PnaCode.ToLower() == paCode.ToLower());
            return dealers.Any(d => d.DivisionCodeNumeric.Contains("01"));
        }

        /// <summary>
        /// Determines if a user is a Lincoln dealer based on their PNA code.
        /// </summary>
        /// <param name="paCode">The PNA code.</param>
        /// <returns>True if the user is a Lincoln dealer; otherwise, false.</returns>
        public async Task<bool> IsLincolnDealer(string paCode)
        {
            var dealers = await _goldDRepository.FindByAsync(d => d.PnaCode.ToLower() == paCode.ToLower());
            return dealers.Any(d => d.DivisionCodeNumeric.Contains("03"));
        }

        /// <summary>
        /// Determines if a user is a dual dealer based on their PNA code.
        /// </summary>
        /// <param name="paCode">The PNA code.</param>
        /// <returns>True if the user is a dual dealer; otherwise, false.</returns>
        public async Task<bool> IsDualDealer(string paCode)
        {
            var dealers = await _goldDRepository.FindByAsync(d => d.PnaCode.ToLower() == paCode.ToLower());
            return dealers.Any(d => !string.IsNullOrEmpty(d.DualDealerCode));
        }

        /// <summary>
        /// Determines the user role based on the fordUserType claim.
        /// </summary>
        /// <param name="fordUserType">The fordUserType claim value.</param>
        /// <returns>The corresponding user role.</returns>
        private static UserRoleEnum GetUserRole(string fordUserType)
        {
            return string.Equals(fordUserType, "Dealer", StringComparison.OrdinalIgnoreCase) ? UserRoleEnum.DEALER : UserRoleEnum.SUPER_USER;
        }

        /// <summary>
        /// Determines the user type based on the fordUserType claim.
        /// </summary>
        /// <param name="fordUserType">The fordUserType claim value.</param>
        /// <returns>The corresponding user type.</returns>
        private static UserTypeEnum GetUserType(string fordUserType)
        {
            return Enum.TryParse(fordUserType, true, out UserTypeEnum userType) ? userType : UserTypeEnum.DEALER;
        }
    }
}
```

---

</SwmSnippet>

This walkthrough highlights the key components and decisions in the <SwmToken path="/FordTube.WebApi/Services/UserService.cs" pos="22:5:5" line-data="    public class UserService">`UserService`</SwmToken> implementation, focusing on how it manages user data and authentication.

<SwmMeta version="3.0.0" repo-id="Z2l0aHViJTNBJTNBRm9yZFR1YmUlM0ElM0FyYXZpc2hhbQ==" repo-name="FordTube"><sup>Powered by [Swimm](https://app.swimm.io/)</sup></SwmMeta>
