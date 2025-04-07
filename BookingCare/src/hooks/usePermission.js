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

  // Kiểm tra xem JWT có chứa thông tin về quyền không
  if (decoded.authorities && Array.isArray(decoded.authorities)) {
    // Kiểm tra nếu quyền tồn tại trong JWT claims
    return decoded.authorities.includes(permissionCode);
  }
  
  // Kiểm tra nếu JWT có chứa thông tin về nhóm quyền
  if (decoded.permissionGroups && Array.isArray(decoded.permissionGroups)) {
    // Duyệt qua từng nhóm quyền để tìm quyền cần kiểm tra
    return decoded.permissionGroups.some(group => 
      group.permissions && 
      Array.isArray(group.permissions) && 
      group.permissions.some(perm => 
        perm.code === permissionCode || 
        perm === permissionCode
      )
    );
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

  // Kiểm tra từ thông tin người dùng trong Redux store
  if (user.permissionGroups && Array.isArray(user.permissionGroups)) {
    return user.permissionGroups.some(group => 
      group.permissions && 
      Array.isArray(group.permissions) && 
      group.permissions.some(perm => 
        perm.code === permissionCode || 
        perm === permissionCode
      )
    );
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
    if (!permissionCode) return false;

    try {
      // Kiểm tra người dùng đã đăng nhập chưa
      if (!user || !user.access_token) return false;

      // Người dùng với role ADMIN luôn có tất cả quyền
      if (user.role === 'ADMIN') return true;

      // Xử lý từ JWT token (Nếu có claims cho quyền)
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const parsedToken = JSON.parse(token);
          const decoded = jwtDecode(parsedToken);
          
          // Kiểm tra quyền trong token
          if (checkPermissionInToken(permissionCode, decoded)) {
            return true;
          }
        } catch (error) {
          console.error('Error decoding JWT token:', error);
        }
      }

      // Fallback: Kiểm tra từ thông tin người dùng trong Redux store
      return checkPermissionInUserData(permissionCode, user);
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
      return false;
    }

    try {
      // Kiểm tra người dùng đã đăng nhập chưa
      if (!user || !user.access_token) return false;

      // Người dùng với role ADMIN luôn có tất cả quyền
      if (user.role === 'ADMIN') return true;

      // Xử lý từ JWT token (Nếu có claims cho quyền)
      const token = localStorage.getItem('access_token');
      let decoded = null;
      
      if (token) {
        try {
          const parsedToken = JSON.parse(token);
          decoded = jwtDecode(parsedToken);
        } catch (error) {
          console.error('Error decoding JWT token:', error);
        }
      }
      
      // Kiểm tra từng quyền trong mảng bằng cách sử dụng vòng lặp thay vì callback
      for (let i = 0; i < permissionCodes.length; i++) {
        const code = permissionCodes[i];
        
        // Kiểm tra trong token
        if (decoded && checkPermissionInToken(code, decoded)) {
          return true;
        }
        
        // Kiểm tra trong thông tin người dùng
        if (checkPermissionInUserData(code, user)) {
          return true;
        }
      }
      
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
      return false;
    }

    try {
      // Kiểm tra người dùng đã đăng nhập chưa
      if (!user || !user.access_token) return false;

      // Người dùng với role ADMIN luôn có tất cả quyền
      if (user.role === 'ADMIN') return true;

      // Xử lý từ JWT token (Nếu có claims cho quyền)
      const token = localStorage.getItem('access_token');
      let decoded = null;
      
      if (token) {
        try {
          const parsedToken = JSON.parse(token);
          decoded = jwtDecode(parsedToken);
        } catch (error) {
          console.error('Error decoding JWT token:', error);
        }
      }
      
      // Kiểm tra từng quyền trong mảng bằng cách sử dụng vòng lặp thay vì callback
      for (let i = 0; i < permissionCodes.length; i++) {
        const code = permissionCodes[i];
        
        // Kiểm tra trong token
        const hasPermissionInToken = decoded && checkPermissionInToken(code, decoded);
        
        // Kiểm tra trong thông tin người dùng
        const hasPermissionInUserData = checkPermissionInUserData(code, user);
        
        // Nếu không có quyền này trong cả hai nơi, trả về false
        if (!hasPermissionInToken && !hasPermissionInUserData) {
          return false;
        }
      }
      
      // Nếu tất cả các quyền đều được tìm thấy, trả về true
      return true;
    } catch (error) {
      console.error('Error checking all permissions:', error);
      return false;
    }
  }, [permissionCodes, user]);
};

export default usePermission; 