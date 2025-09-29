import React from 'react';
import { Plus, Mail, Phone, MapPin } from 'lucide-react';
import './contact-card.css';

// Utility function for class names
const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Contact Info Component
const ContactInfo = ({ icon: Icon, label, value, className = '', ...props }) => {
  return (
    <div className={cn('contact-info', className)} {...props}>
      <div className="contact-info-icon">
        <Icon size={20} />
      </div>
      <div className="contact-info-content">
        <p className="contact-info-label">{label}</p>
        <p className="contact-info-value">{value}</p>
      </div>
    </div>
  );
};

// Main Contact Card Component
export const ContactCard = ({
  title = 'Contact With Us',
  description = 'If you have any questions regarding our Services or need help, please fill out the form here. We do our best to respond within 1 business day.',
  contactInfo = [],
  className = '',
  formSectionClassName = '',
  children,
  ...props
}) => {
  return (
    <div
      className={cn('contact-card', className)}
      {...props}
    >
      {/* Decorative Plus Icons */}
      <Plus className="contact-card-plus contact-card-plus-tl" size={24} />
      <Plus className="contact-card-plus contact-card-plus-tr" size={24} />
      <Plus className="contact-card-plus contact-card-plus-bl" size={24} />
      <Plus className="contact-card-plus contact-card-plus-br" size={24} />
      
      {/* Main Content Section */}
      <div className="contact-card-content">
        <div className="contact-card-info">
          <h1 className="contact-card-title">
            {title}
          </h1>
          <p className="contact-card-description">
            {description}
          </p>
          <div className="contact-card-info-grid">
            {contactInfo.map((info, index) => (
              <ContactInfo key={index} {...info} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Form Section */}
      <div className={cn('contact-card-form-section', formSectionClassName)}>
        {children}
      </div>
    </div>
  );
};

export default ContactCard;
