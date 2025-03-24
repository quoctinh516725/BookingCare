# Beautiful Care Frontend Developer Guide

## Introduction

This guide is designed to help frontend developers effectively integrate with the Beautiful Care API. It provides practical examples, best practices, and common patterns for implementing the frontend application.

## Getting Started

### Base URL

All API endpoints are available at:

```
https://api.beautifulcare.com/api/v1/
```

For local development, use:

```
http://localhost:8080/api/v1/
```

### Authentication

The API uses JWT (JSON Web Token) authentication. After a successful login, you will receive a token that should be included in the `Authorization` header for authenticated requests.

#### Example: Login and Store Token

```javascript
// Using fetch
async function login(email, password) {
  try {
    const response = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Store the token in localStorage
      localStorage.setItem('token', result.data.accessToken);
      localStorage.setItem('tokenType', result.data.tokenType);
      return true;
    } else {
      console.error('Login failed:', result.message);
      return false;
    }
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
}
```

#### Example: Making Authenticated Requests

```javascript
async function fetchData(endpoint) {
  const token = localStorage.getItem('token');
  const tokenType = localStorage.getItem('tokenType');
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  try {
    const response = await fetch(`http://localhost:8080/api/v1/${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `${tokenType} ${token}`,
      },
    });
    
    const result = await response.json();
    
    if (result.success) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}
```

## Common Patterns and Best Practices

### Error Handling

Implement consistent error handling across your application. The API always returns responses in the following format:

```json
{
  "success": true/false,
  "message": "Description of the result or error",
  "data": null or result data
}
```

Example error handling:

```javascript
async function apiCall(endpoint, method = 'GET', body = null) {
  const token = localStorage.getItem('token');
  const tokenType = localStorage.getItem('tokenType');
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `${tokenType} ${token}`;
  }
  
  const options = {
    method,
    headers,
  };
  
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`http://localhost:8080/api/v1/${endpoint}`, options);
    const result = await response.json();
    
    if (!result.success) {
      // Check for unauthorized access
      if (response.status === 401) {
        // Handle token expiration
        localStorage.removeItem('token');
        localStorage.removeItem('tokenType');
        // Redirect to login
        window.location.href = '/login';
      }
      
      throw new Error(result.message);
    }
    
    return result.data;
  } catch (error) {
    // Log the error and rethrow
    console.error(`API error (${method} ${endpoint}):`, error);
    throw error;
  }
}
```

### Data Fetching and State Management

You can use libraries like React Query, SWR, or Redux Toolkit Query to efficiently manage API calls and state. Here's an example using React Query:

```javascript
import { useQuery, useMutation, useQueryClient } from 'react-query';

// Fetch all services
function useServices() {
  return useQuery('services', () => apiCall('services'));
}

// Fetch a specific service
function useService(id) {
  return useQuery(['service', id], () => apiCall(`services/${id}`), {
    enabled: !!id,
  });
}

// Create a booking
function useCreateBooking() {
  const queryClient = useQueryClient();
  
  return useMutation(
    (bookingData) => apiCall('bookings', 'POST', bookingData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookings');
      },
    }
  );
}
```

## User Management

### User Registration

```javascript
async function registerUser(userData) {
  return apiCall('auth/register', 'POST', userData);
}
```

### User Profile Management

```javascript
// Get current user profile
function useCurrentUser() {
  const userId = localStorage.getItem('userId');
  return useQuery(['user', userId], () => apiCall(`users/${userId}`), {
    enabled: !!userId,
  });
}

// Update user profile
function useUpdateProfile() {
  const queryClient = useQueryClient();
  const userId = localStorage.getItem('userId');
  
  return useMutation(
    (profileData) => apiCall(`users/${userId}`, 'PUT', profileData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['user', userId]);
      },
    }
  );
}
```

## Bookings Implementation

### Creating a Booking Form

Example of a booking form component in React:

```jsx
import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';

function BookingForm() {
  const [formData, setFormData] = useState({
    specialistId: '',
    serviceId: '',
    startTime: '',
    notes: '',
  });
  
  // Get current user ID
  const customerId = localStorage.getItem('userId');
  
  // Fetch services
  const { data: services, isLoading: servicesLoading } = useQuery('services', 
    () => apiCall('services'));
  
  // Fetch specialists
  const { data: specialists, isLoading: specialistsLoading } = useQuery('specialists', 
    () => apiCall('specialists'));
  
  // Create booking mutation
  const createBooking = useMutation(
    (bookingData) => apiCall('bookings', 'POST', {
      ...bookingData,
      customerId,
    }),
    {
      onSuccess: () => {
        alert('Booking created successfully!');
        // Reset form
        setFormData({
          specialistId: '',
          serviceId: '',
          startTime: '',
          notes: '',
        });
      },
      onError: (error) => {
        alert(`Error creating booking: ${error.message}`);
      },
    }
  );
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    createBooking.mutate(formData);
  };
  
  if (servicesLoading || specialistsLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <h2>Book an Appointment</h2>
      
      <div>
        <label>Select Service:</label>
        <select 
          name="serviceId" 
          value={formData.serviceId} 
          onChange={handleChange}
          required
        >
          <option value="">-- Select a Service --</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} (${service.price})
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label>Select Specialist:</label>
        <select 
          name="specialistId" 
          value={formData.specialistId} 
          onChange={handleChange}
          required
        >
          <option value="">-- Select a Specialist --</option>
          {specialists.map((specialist) => (
            <option key={specialist.id} value={specialist.id}>
              {specialist.firstName} {specialist.lastName}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label>Appointment Date/Time:</label>
        <input 
          type="datetime-local" 
          name="startTime" 
          value={formData.startTime} 
          onChange={handleChange}
          required
        />
      </div>
      
      <div>
        <label>Notes:</label>
        <textarea 
          name="notes" 
          value={formData.notes} 
          onChange={handleChange}
          rows="4"
        />
      </div>
      
      <button 
        type="submit" 
        disabled={createBooking.isLoading}
      >
        {createBooking.isLoading ? 'Creating Booking...' : 'Book Appointment'}
      </button>
    </form>
  );
}
```

## Blog Implementation

### Displaying Blog Posts

Example of a blog listing component:

```jsx
import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';

function BlogList() {
  // Fetch only published blog posts
  const { data: blogs, isLoading, error } = useQuery('publishedBlogs', 
    () => apiCall('blogs/published'));
  
  if (isLoading) {
    return <div>Loading blog posts...</div>;
  }
  
  if (error) {
    return <div>Error loading blog posts: {error.message}</div>;
  }
  
  return (
    <div className="blog-list">
      <h1>Blog Posts</h1>
      
      {blogs.map((blog) => (
        <article key={blog.id} className="blog-card">
          {blog.imageUrl && (
            <img src={blog.imageUrl} alt={blog.title} className="blog-image" />
          )}
          
          <div className="blog-content">
            <h2>{blog.title}</h2>
            
            <div className="blog-meta">
              <span>Category: {blog.category.name}</span>
              <span>By: {blog.author.firstName} {blog.author.lastName}</span>
              <span>Published: {new Date(blog.publishedAt).toLocaleDateString()}</span>
            </div>
            
            <p className="blog-excerpt">
              {blog.content.substring(0, 150)}...
            </p>
            
            <Link to={`/blog/${blog.slug}`} className="read-more">
              Read More
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
```

### Displaying a Single Blog Post

```jsx
import React from 'react';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';

function BlogPost() {
  const { slug } = useParams();
  
  const { data: blog, isLoading, error } = useQuery(
    ['blog', slug], 
    () => apiCall(`blogs/slug/${slug}`)
  );
  
  if (isLoading) {
    return <div>Loading blog post...</div>;
  }
  
  if (error) {
    return <div>Error loading blog post: {error.message}</div>;
  }
  
  return (
    <article className="blog-post">
      <h1>{blog.title}</h1>
      
      <div className="blog-meta">
        <span>Category: {blog.category.name}</span>
        <span>By: {blog.author.firstName} {blog.author.lastName}</span>
        <span>Published: {new Date(blog.publishedAt).toLocaleDateString()}</span>
      </div>
      
      {blog.imageUrl && (
        <img src={blog.imageUrl} alt={blog.title} className="featured-image" />
      )}
      
      <div 
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: blog.content }}
      />
    </article>
  );
}
```

## Admin Interfaces

### Blog Management

Example of a blog post editor for administrators:

```jsx
import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill'; // Rich text editor

function BlogEditor() {
  const { id } = useParams(); // For editing existing blog post
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    categoryId: '',
    published: false,
  });
  
  // Fetch blog categories
  const { data: categories, isLoading: categoriesLoading } = useQuery(
    'blogCategories', 
    () => apiCall('blog-categories')
  );
  
  // Fetch blog post for editing
  const { data: blogPost, isLoading: blogLoading } = useQuery(
    ['blog', id], 
    () => apiCall(`blogs/${id}`), 
    {
      enabled: isEditing,
      onSuccess: (data) => {
        setFormData({
          title: data.title,
          content: data.content,
          imageUrl: data.imageUrl || '',
          categoryId: data.category.id,
          published: data.published,
        });
      },
    }
  );
  
  // Create mutation
  const createBlog = useMutation(
    (data) => {
      const currentUserId = localStorage.getItem('userId');
      return apiCall(`blogs?authorId=${currentUserId}`, 'POST', data);
    },
    {
      onSuccess: () => {
        alert('Blog post created successfully!');
        navigate('/admin/blogs');
      },
    }
  );
  
  // Update mutation
  const updateBlog = useMutation(
    (data) => apiCall(`blogs/${id}`, 'PUT', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['blog', id]);
        alert('Blog post updated successfully!');
        navigate('/admin/blogs');
      },
    }
  );
  
  // Publish mutation
  const publishBlog = useMutation(
    () => apiCall(`blogs/${id}/publish`, 'PATCH'),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['blog', id]);
        alert('Blog post published successfully!');
      },
    }
  );
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handleContentChange = (content) => {
    setFormData({
      ...formData,
      content,
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateBlog.mutate(formData);
    } else {
      createBlog.mutate(formData);
    }
  };
  
  const handlePublish = () => {
    publishBlog.mutate();
  };
  
  if ((isEditing && blogLoading) || categoriesLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="blog-editor">
      <h1>{isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
      
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={handleChange}
            required
          />
        </div>
        
        <div>
          <label>Category:</label>
          <select 
            name="categoryId" 
            value={formData.categoryId} 
            onChange={handleChange}
            required
          >
            <option value="">-- Select Category --</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label>Image URL:</label>
          <input 
            type="url" 
            name="imageUrl" 
            value={formData.imageUrl} 
            onChange={handleChange}
          />
          {formData.imageUrl && (
            <img src={formData.imageUrl} alt="Preview" className="image-preview" />
          )}
        </div>
        
        <div>
          <label>Content:</label>
          <ReactQuill 
            value={formData.content} 
            onChange={handleContentChange}
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                [{'list': 'ordered'}, {'list': 'bullet'}],
                ['link', 'image'],
                ['clean']
              ],
            }}
          />
        </div>
        
        <div>
          <label>
            <input 
              type="checkbox" 
              name="published" 
              checked={formData.published} 
              onChange={handleChange}
            />
            Draft Mode (unchecked = published)
          </label>
        </div>
        
        <div className="button-group">
          <button 
            type="submit" 
            disabled={createBlog.isLoading || updateBlog.isLoading}
          >
            {isEditing ? 'Update Post' : 'Create Post'}
          </button>
          
          {isEditing && !blogPost.published && (
            <button 
              type="button" 
              onClick={handlePublish}
              disabled={publishBlog.isLoading}
            >
              Publish Now
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
```

## Error Handling and Validation

### Form Validation

Example of form validation with error messages:

```jsx
import React, { useState } from 'react';
import { useMutation } from 'react-query';

function RegisterForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});
  
  const register = useMutation(
    (userData) => apiCall('auth/register', 'POST', userData),
    {
      onSuccess: () => {
        alert('Registration successful! Please log in.');
        // Redirect to login page
      },
      onError: (error) => {
        if (error.message.includes('Email already exists')) {
          setErrors({
            ...errors,
            email: 'This email is already registered',
          });
        }
      },
    }
  );
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Remove confirmPassword before sending
      const { confirmPassword, ...userData } = formData;
      register.mutate(userData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="register-form">
      <h2>Create Account</h2>
      
      <div className="form-group">
        <label>First Name</label>
        <input 
          type="text" 
          name="firstName" 
          value={formData.firstName} 
          onChange={handleChange}
          className={errors.firstName ? 'error' : ''}
        />
        {errors.firstName && <p className="error-message">{errors.firstName}</p>}
      </div>
      
      <div className="form-group">
        <label>Last Name</label>
        <input 
          type="text" 
          name="lastName" 
          value={formData.lastName} 
          onChange={handleChange}
          className={errors.lastName ? 'error' : ''}
        />
        {errors.lastName && <p className="error-message">{errors.lastName}</p>}
      </div>
      
      <div className="form-group">
        <label>Email</label>
        <input 
          type="email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <p className="error-message">{errors.email}</p>}
      </div>
      
      <div className="form-group">
        <label>Password</label>
        <input 
          type="password" 
          name="password" 
          value={formData.password} 
          onChange={handleChange}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <p className="error-message">{errors.password}</p>}
      </div>
      
      <div className="form-group">
        <label>Confirm Password</label>
        <input 
          type="password" 
          name="confirmPassword" 
          value={formData.confirmPassword} 
          onChange={handleChange}
          className={errors.confirmPassword ? 'error' : ''}
        />
        {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
      </div>
      
      <button 
        type="submit" 
        disabled={register.isLoading}
      >
        {register.isLoading ? 'Creating Account...' : 'Register'}
      </button>
    </form>
  );
}
```

## Recommended Libraries

- **API Integration**: Axios, React Query, SWR
- **State Management**: Redux Toolkit, Zustand
- **Form Handling**: Formik, React Hook Form
- **Validation**: Yup, Zod
- **UI Components**: Material-UI, Chakra UI, Tailwind CSS
- **Date/Time**: date-fns, Day.js
- **Rich Text Editing**: React Quill, Draft.js

## Performance Considerations

- Implement pagination for lists (services, specialists, blog posts)
- Use proper caching strategies with React Query
- Lazy load images and components
- Consider code splitting for larger applications
- Optimize API calls by requesting only necessary data

## Deployment Checklist

- Update API base URL for production environment
- Set up proper error tracking (Sentry, LogRocket)
- Enable HTTPS for all API calls
- Set up proper CORS configuration
- Implement appropriate security measures for token storage
- Test authentication flows thoroughly 