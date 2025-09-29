import React, { useState, useId } from 'react';
import { Eye, EyeOff, User, Mail, Lock, MessageSquare } from 'lucide-react';
import { Typewriter } from './typewriter';
import './auth-fuse.css';

// Utility function for class names
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Label Component
const Label = React.forwardRef(({ className = '', children, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('auth-label', className)}
    {...props}
  >
    {children}
  </label>
));
Label.displayName = 'Label';

// Button Component
const Button = React.forwardRef(({ 
  className = '', 
  variant = 'default', 
  size = 'default', 
  asChild = false, 
  children, 
  ...props 
}, ref) => {
  const Comp = asChild ? 'div' : 'button';
  const buttonClasses = cn(
    'auth-btn',
    `auth-btn-${variant}`,
    `auth-btn-${size}`,
    className
  );
  
  return (
    <Comp className={buttonClasses} ref={ref} {...props}>
      {children}
    </Comp>
  );
});
Button.displayName = 'Button';

// Input Component
const Input = React.forwardRef(({ className = '', type = 'text', ...props }, ref) => (
  <input
    type={type}
    className={cn('auth-input', className)}
    ref={ref}
    {...props}
  />
));
Input.displayName = 'Input';

// Password Input Component
const PasswordInput = React.forwardRef(({ 
  className = '', 
  label, 
  ...props 
}, ref) => {
  const id = useId();
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  
  return (
    <div className="auth-password-container">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="auth-password-input-wrapper">
        <Input 
          id={id} 
          type={showPassword ? "text" : "password"} 
          className={cn("auth-password-input", className)} 
          ref={ref} 
          {...props} 
        />
        <button 
          type="button" 
          onClick={togglePasswordVisibility} 
          className="auth-password-toggle"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';

// Sign In Form Component
const SignInForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="on" className="auth-form">
      <div className="auth-form-header">
        <h1 className="auth-title">Sign in to your account</h1>
        <p className="auth-subtitle">Enter your credentials below to sign in</p>
      </div>
      
      {error && (
        <div className="auth-error">
          <div className="auth-error-icon">⚠️</div>
          <div className="auth-error-text">{error}</div>
        </div>
      )}
      
      <div className="auth-form-fields">
        <div className="auth-field">
          <Label htmlFor="username">
            <User size={16} className="me-2" />
            Username
          </Label>
          <Input 
            id="username" 
            name="username" 
            type="text" 
            placeholder="Enter your username" 
            required 
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        
        <PasswordInput 
          name="password" 
          label={
            <span>
              <Lock size={16} className="me-2" />
              Password
            </span>
          }
          required 
          autoComplete="current-password" 
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
        />
        
        <Button type="submit" variant="primary" className="auth-submit-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </div>
    </form>
  );
};

// Sign Up Form Component
const SignUpForm = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      onSubmit({ error: 'Passwords do not match' });
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} autoComplete="on" className="auth-form">
      <div className="auth-form-header">
        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Enter your details below to sign up</p>
      </div>
      
      {error && (
        <div className="auth-error">
          <div className="auth-error-icon">⚠️</div>
          <div className="auth-error-text">{error}</div>
        </div>
      )}
      
      <div className="auth-form-fields">
        <div className="auth-field">
          <Label htmlFor="name">
            <User size={16} className="me-2" />
            Full Name
          </Label>
          <Input 
            id="name" 
            name="username" 
            type="text" 
            placeholder="Enter your full name" 
            required 
            autoComplete="name"
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        
        <div className="auth-field">
          <Label htmlFor="email">
            <Mail size={16} className="me-2" />
            Email
          </Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="Enter your email" 
            required 
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        
        <PasswordInput 
          name="password" 
          label={
            <span>
              <Lock size={16} className="me-2" />
              Password
            </span>
          }
          required 
          autoComplete="new-password" 
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
        />
        
        <PasswordInput 
          name="confirmPassword" 
          label={
            <span>
              <Lock size={16} className="me-2" />
              Confirm Password
            </span>
          }
          required 
          autoComplete="new-password" 
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
        />
        
        <Button type="submit" variant="primary" className="auth-submit-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </div>
    </form>
  );
};

// Auth Form Container Component
const AuthFormContainer = ({ isSignIn, onToggle, onSignIn, onSignUp, loading, error }) => {
  return (
    <div className="auth-form-container">
      {isSignIn ? (
        <SignInForm onSubmit={onSignIn} loading={loading} error={error} />
      ) : (
        <SignUpForm onSubmit={onSignUp} loading={loading} error={error} />
      )}
      
      <div className="auth-form-footer">
        <div className="auth-form-toggle">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
          <Button variant="link" className="auth-toggle-btn" onClick={onToggle}>
            {isSignIn ? "Sign up" : "Sign in"}
          </Button>
        </div>
        
      </div>
    </div>
  );
};

// Main Auth UI Component
export const AuthUI = ({ 
  signInContent = {}, 
  signUpContent = {},
  onSignIn,
  onSignUp,
  loading = false,
  error = null,
  customComponent = null
}) => {
  const [isSignIn, setIsSignIn] = useState(true);
  
  const toggleForm = () => setIsSignIn((prev) => !prev);

  const defaultSignInContent = {
    image: {
      src: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      alt: "Modern workspace for sign-in"
    },
    quote: {
      text: "Welcome Back! The journey continues.",
      author: "AIHub Team"
    }
  };

  const defaultSignUpContent = {
    image: {
      src: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
      alt: "Creative workspace for new beginnings"
    },
    quote: {
      text: "Create an account. A new chapter awaits.",
      author: "AIHub Team"
    }
  };

  const finalSignInContent = {
    image: { ...defaultSignInContent.image, ...signInContent.image },
    quote: { ...defaultSignInContent.quote, ...signInContent.quote },
  };
  
  const finalSignUpContent = {
    image: { ...defaultSignUpContent.image, ...signUpContent.image },
    quote: { ...defaultSignUpContent.quote, ...signUpContent.quote },
  };

  const currentContent = isSignIn ? finalSignInContent : finalSignUpContent;

  return (
    <div className="auth-ui-container">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>
      
      <div className="auth-form-section">
        <AuthFormContainer 
          isSignIn={isSignIn} 
          onToggle={toggleForm}
          onSignIn={onSignIn}
          onSignUp={onSignUp}
          loading={loading}
          error={error}
        />
      </div>

      {customComponent ? (
        <div className="auth-image-section">
          <div className="auth-image-overlay" />
          {customComponent}
          <div className="auth-quote-container">
            <blockquote className="auth-quote">
              <p className="auth-quote-text">
                "<Typewriter
                  key={currentContent.quote.text}
                  text={currentContent.quote.text}
                  speed={60}
                />"
              </p>
              <cite className="auth-quote-author">
                — {currentContent.quote.author}
              </cite>
            </blockquote>
          </div>
        </div>
      ) : (
        <div
          className="auth-image-section"
          style={{ backgroundImage: `url(${currentContent.image.src})` }}
          key={currentContent.image.src}
        >
          <div className="auth-image-overlay" />
          
          <div className="auth-quote-container">
            <blockquote className="auth-quote">
              <p className="auth-quote-text">
                "<Typewriter
                  key={currentContent.quote.text}
                  text={currentContent.quote.text}
                  speed={60}
                />"
              </p>
              <cite className="auth-quote-author">
                — {currentContent.quote.author}
              </cite>
            </blockquote>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthUI;
