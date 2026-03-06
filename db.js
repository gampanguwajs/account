class UserManagementModule {
  async createUser(userData) {
    // Validation pipeline
    await this.validationPipeline(userData);
    
    // Duplicate check
    await this.checkDuplicates(userData.email);
    
    // Password hashing
    userData.passwordHash = await bcrypt.hash(userData.password, 12);
    
    // Create user record
    const user = await userRepository.create(userData);
    
    // Send verification email
    await emailService.sendVerification(user.email, user.verificationToken);
    
    // Add to analytics
    await analytics.track('user.created', user.id);
    
    return user;
  }
}