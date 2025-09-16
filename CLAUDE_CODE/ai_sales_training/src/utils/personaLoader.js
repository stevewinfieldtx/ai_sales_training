// Persona loader utility for dynamic persona loading
export class PersonaLoader {
  constructor() {
    this.personas = {};
    this.loaded = false;
  }

  // Load all personas from JSON files
  async loadAllPersonas() {
    if (this.loaded) return this.personas;

    try {
      // Import all persona JSON files
      const lawManagingPartner = await import('../personas/Professional_Services/Law_Firms/managing-partner.json');
      const lawItDirector = await import('../personas/Professional_Services/Law_Firms/it-director.json');
      const accountingManagingPartner = await import('../personas/Professional_Services/Accounting_Firms/managing-partner.json');
      const accountingItManager = await import('../personas/Professional_Services/Accounting_Firms/it-manager.json');
      const consultingManagingDirector = await import('../personas/Professional_Services/Consulting_Firms/managing-director.json');
      const consultingOperationsManager = await import('../personas/Professional_Services/Consulting_Firms/operations-manager.json');

      // Add to personas object using their IDs
      this.personas[lawManagingPartner.default.id] = lawManagingPartner.default;
      this.personas[lawItDirector.default.id] = lawItDirector.default;
      this.personas[accountingManagingPartner.default.id] = accountingManagingPartner.default;
      this.personas[accountingItManager.default.id] = accountingItManager.default;
      this.personas[consultingManagingDirector.default.id] = consultingManagingDirector.default;
      this.personas[consultingOperationsManager.default.id] = consultingOperationsManager.default;

      this.loaded = true;
      return this.personas;
    } catch (error) {
      console.error('Error loading personas:', error);
      return {};
    }
  }

  // Get personas by industry
  getPersonasByIndustry(industry) {
    return Object.values(this.personas).filter(persona => 
      persona.industry === industry
    );
  }

  // Get personas by sub-industry
  getPersonasBySubIndustry(subIndustry) {
    return Object.values(this.personas).filter(persona => 
      persona.subIndustry === subIndustry
    );
  }

  // Get persona by ID
  getPersonaById(id) {
    return this.personas[id];
  }

  // Get all unique industries
  getIndustries() {
    return [...new Set(Object.values(this.personas).map(p => p.industry))];
  }

  // Get all unique sub-industries
  getSubIndustries() {
    return [...new Set(Object.values(this.personas).map(p => p.subIndustry))];
  }

  // Get sub-industries for a specific industry
  getSubIndustriesForIndustry(industry) {
    return [...new Set(
      Object.values(this.personas)
        .filter(p => p.industry === industry)
        .map(p => p.subIndustry)
    )];
  }
}

// Create singleton instance
export const personaLoader = new PersonaLoader();