import React, { useState } from 'react';
import { FaUserShield, FaChalkboardTeacher, FaUserGraduate, FaCrown } from 'react-icons/fa';

const RoleSelection = ({ onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: 'SuperAdmin',
      name: 'Super Admin',
      icon: FaCrown,
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
      description: 'Full system control and management'
    },
    {
      id: 'Admin',
      name: 'Admin',
      icon: FaUserShield,
      color: '#EF4444',
      gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
      description: 'Manage school operations and staff'
    },
    {
      id: 'Teacher',
      name: 'Teacher',
      icon: FaChalkboardTeacher,
      color: '#3B82F6',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      description: 'Access teaching tools and resources'
    },
    {
      id: 'Student',
      name: 'Student',
      icon: FaUserGraduate,
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
      description: 'Access learning materials and grades'
    }
  ];

  const handleContinue = () => {
    if (selectedRole) {
      onRoleSelect(selectedRole);
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex justify-content-center align-items-center"
      style={{ 
        backgroundColor: '#0F172A',
        backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)'
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-9">
            <div 
              className="card shadow-lg border-0"
              style={{
                backgroundColor: '#1E293B',
                borderRadius: '24px',
                overflow: 'hidden'
              }}
            >
              <div className="card-body p-5">
                <div className="text-center mb-5">
                  <h2 className="fw-bold mb-2" style={{ color: '#F1F5F9', fontSize: '2rem' }}>
                    Welcome to School Management System
                  </h2>
                  <p className="text-muted mb-0" style={{ color: '#94A3B8', fontSize: '1.1rem' }}>
                    Please select your role to continue
                  </p>
                </div>

                <div className="row g-4 mb-4">
                  {roles.map((role) => {
                    const Icon = role.icon;
                    const isSelected = selectedRole === role.id;
                    
                    return (
                      <div key={role.id} className="col-md-6">
                        <div
                          onClick={() => setSelectedRole(role.id)}
                          className="h-100"
                          style={{
                            cursor: 'pointer',
                            transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <div
                            className="card h-100 border-0 position-relative"
                            style={{
                              backgroundColor: '#334155',
                              borderRadius: '16px',
                              border: isSelected ? `3px solid ${role.color}` : '3px solid transparent',
                              boxShadow: isSelected 
                                ? `0 0 30px ${role.color}40` 
                                : '0 4px 6px rgba(0, 0, 0, 0.1)',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <div className="card-body p-4">
                              <div className="d-flex align-items-center mb-3">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                  style={{
                                    width: '64px',
                                    height: '64px',
                                    background: role.gradient,
                                    boxShadow: `0 4px 14px ${role.color}40`
                                  }}
                                >
                                  <Icon style={{ fontSize: '28px', color: '#FFFFFF' }} />
                                </div>
                                <div className="flex-grow-1">
                                  <h4 className="mb-1 fw-bold" style={{ color: '#F1F5F9' }}>
                                    {role.name}
                                  </h4>
                                  <p className="mb-0 small" style={{ color: '#94A3B8' }}>
                                    {role.description}
                                  </p>
                                </div>
                              </div>
                              
                              {isSelected && (
                                <div 
                                  className="mt-3 py-2 px-3 rounded text-center"
                                  style={{
                                    background: `${role.color}20`,
                                    border: `1px solid ${role.color}40`
                                  }}
                                >
                                  <small className="fw-semibold" style={{ color: role.color }}>
                                    ✓ Selected
                                  </small>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center mt-4">
                  <button
                    onClick={handleContinue}
                    disabled={!selectedRole}
                    className="btn btn-lg px-5 py-3 text-white fw-semibold border-0"
                    style={{
                      background: selectedRole 
                        ? 'linear-gradient(135deg, #9F8054 0%, #C9A76E 100%)' 
                        : '#475569',
                      borderRadius: '12px',
                      fontSize: '1.1rem',
                      cursor: selectedRole ? 'pointer' : 'not-allowed',
                      opacity: selectedRole ? 1 : 0.6,
                      boxShadow: selectedRole ? '0 4px 20px rgba(159, 128, 84, 0.3)' : 'none',
                      transition: 'all 0.3s ease',
                      minWidth: '200px'
                    }}
                  >
                    Continue to Login →
                  </button>
                  
                  {!selectedRole && (
                    <p className="text-muted mt-3 mb-0 small" style={{ color: '#64748B' }}>
                      Please select a role to proceed
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;