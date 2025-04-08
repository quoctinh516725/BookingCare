import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';

/**
 * Hàm kiểm tra quyền từ JWT token
 * @param {string} permissionCode - Mã quyền cần kiểm tra
 * @param {Object} decoded - Dữ liệu giải mã từ JWT token
 * @returns {boolean} - true nếu quyền được tìm thấy
 */
const checkPermissionInToken = (permissionCode, decoded) => {
  if (!decoded) return false;

  // Kiểm tra role ADMIN
  if (decoded.role === 'ADMIN') {
    console.debug('User is ADMIN, granting all permissions');
    return true;
  }

  // Kiểm tra xem JWT có chứa thông tin về quyền không
  if (decoded.permissions && Array.isArray(decoded.permissions)) {
    // Kiểm tra nếu quyền tồn tại trong JWT claims
    const hasPermission = decoded.permissions.includes(permissionCode);
    console.debug('Checking permission in token:', {
      permissionCode,
      permissions: decoded.permissions,
      hasPermission
    });
    return hasPermission;
  }

  return false;
};

/**
 * Hàm kiểm tra quyền từ thông tin user trong Redux
 * @param {string} permissionCode - Mã quyền cần kiểm tra
 * @param {Object} user - Đối tượng user từ Redux store
 * @returns {boolean} - true nếu quyền được tìm thấy
 */
const checkPermissionInUserData = (permissionCode, user) => {
  if (!user) return false;

  // Kiểm tra role ADMIN
  if (user.role === 'ADMIN') {
    console.debug('User is ADMIN, granting all permissions');
    return true;
  }

  // Kiểm tra từ thông tin người dùng trong Redux store
  if (user.permissionGroups && Array.isArray(user.permissionGroups)) {
    const hasPermission = user.permissionGroups.some(group => 
      group.permissions && 
      Array.isArray(group.permissions) && 
      group.permissions.some(perm => 
        perm.code === permissionCode || 
        perm === permissionCode
      )
    );
    console.debug('Checking permission in user data:', {
      permissionCode,
      permissionGroups: user.permissionGroups,
      hasPermission
    });
    return hasPermission;
  }

  return false;
};

/**
 * Custom hook kiểm tra xem người dùng có quyền cụ thể hay không
 * @param {string} permissionCode - Mã quyền cần kiểm tra
 * @returns {boolean} - true nếu người dùng có quyền, false nếu không
 */
const usePermission = (permissionCode) => {
  const user = useSelector((state) => state.user);

  return useMemo(() => {
    // Không kiểm tra với permissionCode rỗng
    if (!permissionCode) {
      console.debug('No permission code provided');
      return false;
    }

    try {
      // Kiểm tra người dùng đã đăng nhập chưa
      if (!user || !user.access_token) {
        console.debug('User not logged in or no access token');
        return false;
      }

      // Xử lý từ JWT token
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const parsedToken = JSON.parse(token);
          const decoded = jwtDecode(parsedToken);
          
          // Log thông tin quyền từ token
          console.debug('Checking permissions in token:', {
            permissionCode,
            permissions: decoded.permissions,
            permissionGroups: decoded.permissionGroups,
            role: decoded.role
          });
          
          // Kiểm tra quyền trong token
          if (checkPermissionInToken(permissionCode, decoded)) {
            console.debug('Permission found in token');
            return true;
          }
        } catch (error) {
          console.error('Error decoding JWT token:', error);
        }
      }

      // Fallback: Kiểm tra từ thông tin người dùng trong Redux store
      const hasPermission = checkPermissionInUserData(permissionCode, user);
      console.debug('Permission check result from user data:', hasPermission);
      return hasPermission;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }, [permissionCode, user]);
};

/**
 * Kiểm tra xem người dùng có ít nhất một trong các quyền được chỉ định không (OR logic)
 * @param {string[]} permissionCodes - Mảng các mã quyền cần kiểm tra
 * @returns {boolean} - true nếu người dùng có ít nhất một quyền, false nếu không có quyền nào
 */
export const useAnyPermission = (permissionCodes) => {
  const user = useSelector((state) => state.user);

  return useMemo(() => {
    // Không kiểm tra với mảng rỗng
    if (!permissionCodes || !Array.isArray(permissionCodes) || permissionCodes.length === 0) {
      console.debug('No permission codes to check');
      return false;
    }

    try {
      // Kiểm tra người dùng đã đăng nhập chưa
      if (!user || !user.access_token) {
        console.debug('User not logged in or no access token');
        return false;
      }

      // Xử lý từ JWT token
      const token = localStorage.getItem('access_token');
      let decoded = null;
      
      if (token) {
        try {
          const parsedToken = JSON.parse(token);
          decoded = jwtDecode(parsedToken);
          
          // Log thông tin quyền từ token
          console.debug('Checking permissions in token:', {
            permissionCodes,
            permissions: decoded.permissions,
            permissionGroups: decoded.permissionGroups,
            role: decoded.role
          });
        } catch (error) {
          console.error('Error decoding JWT token:', error);
        }
      }
      
      // Kiểm tra từng quyền trong mảng
      for (let i = 0; i < permissionCodes.length; i++) {
        const code = permissionCodes[i];
        
        // Kiểm tra trong token
        if (decoded && checkPermissionInToken(code, decoded)) {
          console.debug('Permission found in token:', code);
          return true;
        }
        
        // Kiểm tra trong thông tin người dùng
        if (checkPermissionInUserData(code, user)) {
          console.debug('Permission found in user data:', code);
          return true;
        }
      }
      
      console.debug('No permissions found in token or user data');
      return false;
    } catch (error) {
      console.error('Error checking any permissions:', error);
      return false;
    }
  }, [permissionCodes, user]);
};

/**
 * Kiểm tra xem người dùng có tất cả các quyền được chỉ định không (AND logic)
 * @param {string[]} permissionCodes - Mảng các mã quyền cần kiểm tra
 * @returns {boolean} - true nếu người dùng có tất cả các quyền, false nếu thiếu bất kỳ quyền nào
 */
export const useAllPermissions = (permissionCodes) => {
  const user = useSelector((state) => state.user);

  return useMemo(() => {
    // Không kiểm tra với mảng rỗng
    if (!permissionCodes || !Array.isArray(permissionCodes) || permissionCodes.length === 0) {
      console.debug('No permission codes to check');
      return false;
    }

    try {
      // Kiểm tra người dùng đã đăng nhập chưa
      if (!user || !user.access_token) {
        console.debug('User not logged in or no access token');
        return false;
      }

      // Xử lý từ JWT token
      const token = localStorage.getItem('access_token');
      let decoded = null;
      
      if (token) {
        try {
          const parsedToken = JSON.parse(token);
          decoded = jwtDecode(parsedToken);
          
          // Log thông tin quyền từ token
          console.debug('Checking permissions in token:', {
            permissionCodes,
            permissions: decoded.permissions,
            permissionGroups: decoded.permissionGroups,
            role: decoded.role
          });
        } catch (error) {
          console.error('Error decoding JWT token:', error);
        }
      }
      
      // Kiểm tra từng quyền trong mảng
      for (let i = 0; i < permissionCodes.length; i++) {
        const code = permissionCodes[i];
        
        // Kiểm tra trong token
        const hasPermissionInToken = decoded && checkPermissionInToken(code, decoded);
        
        // Kiểm tra trong thông tin người dùng
        const hasPermissionInUserData = checkPermissionInUserData(code, user);
        
        // Log kết quả kiểm tra
        console.debug('Permission check result:', {
          code,
          hasPermissionInToken,
          hasPermissionInUserData
        });
        
        // Nếu không có quyền này trong cả hai nơi, trả về false
        if (!hasPermissionInToken && !hasPermissionInUserData) {
          console.debug('Permission not found:', code);
          return false;
        }
      }
      
      console.debug('All permissions found');
      return true;
    } catch (error) {
      console.error('Error checking all permissions:', error);
      return false;
    }
  }, [permissionCodes, user]);
};

export default usePermission; 