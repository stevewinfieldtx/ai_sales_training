import manifest from '../personas/personas-manifest.json';
import personaLibraryDefinition from '../personas/persona-library.json';

const PERSONA_IMPORTERS = {
  'Professional_Services/Law_Firms/managing-partner.json': () => import('../personas/Professional_Services/Law_Firms/managing-partner.json'),
  'Professional_Services/Law_Firms/it-director.json': () => import('../personas/Professional_Services/Law_Firms/it-director.json'),
  'Professional_Services/Accounting_Firms/managing-partner.json': () => import('../personas/Professional_Services/Accounting_Firms/managing-partner.json'),
  'Professional_Services/Accounting_Firms/it-manager.json': () => import('../personas/Professional_Services/Accounting_Firms/it-manager.json'),
  'Professional_Services/Consulting_Firms/managing-director.json': () => import('../personas/Professional_Services/Consulting_Firms/managing-director.json'),
  'Professional_Services/Consulting_Firms/operations-manager.json': () => import('../personas/Professional_Services/Consulting_Firms/operations-manager.json')
};

// Persona loader utility for dynamic persona loading that is aware of the persona-library manifest
export class PersonaLoader {
  constructor() {
    this.personas = {};
    this.loaded = false;
    this.libraryCache = new Map();
  }

  async ensurePersonasLoaded() {
    if (this.loaded) {
      return;
    }

    try {
      const personaEntries = await Promise.all(
        manifest.personas.map(async (personaMeta) => {
          const importer = PERSONA_IMPORTERS[personaMeta.file];

          if (!importer) {
            console.warn(`No importer registered for persona file ${personaMeta.file}`);
            return null;
          }

          try {
            const module = await importer();
            const persona = module?.default;

            if (!persona?.id) {
              console.warn(`Persona payload for ${personaMeta.file} is missing an id.`);
              return null;
            }

            return [persona.id, persona];
          } catch (error) {
            console.error(`Failed to import persona file ${personaMeta.file}:`, error);
            return null;
          }
        })
      );

      personaEntries
        .filter(Boolean)
        .forEach(([id, persona]) => {
          this.personas[id] = persona;
        });

      this.loaded = true;
    } catch (error) {
      console.error('Error loading personas from manifest:', error);
      this.personas = {};
      this.loaded = true;
    }
  }

  async loadAllPersonas() {
    await this.ensurePersonasLoaded();
    return this.personas;
  }

  normalizeDomain(domain) {
    if (!domain) return null;
    const trimmed = domain.trim().toLowerCase();
    if (!trimmed) return null;

    const withoutProtocol = trimmed.replace(/^https?:\/\//, '');
    const withoutPath = withoutProtocol.split('/')[0];
    const withoutWww = withoutPath.startsWith('www.') ? withoutPath.slice(4) : withoutPath;

    return withoutWww;
  }

  resolveDomainOverride(normalizedDomain) {
    if (!normalizedDomain) {
      return null;
    }

    const overrides = personaLibraryDefinition.domainOverrides || {};
    const baseDomain = normalizedDomain.split('.').slice(-2).join('.');

    return (
      overrides[normalizedDomain] ||
      overrides[baseDomain] ||
      null
    );
  }

  sanitizeSelections(offerings, desiredSelections = {}) {
    const findOffering = (id) => offerings.find((offering) => offering.id === id);
    const findIndustry = (offering, id) => offering?.industries?.find((industry) => industry.id === id);
    const findSubIndustry = (industry, id) => industry?.subIndustries?.find((sub) => sub.id === id);
    const findPersona = (subIndustry, id) => subIndustry?.personas?.find((persona) => persona.id === id);

    const fallbackOffering = findOffering(desiredSelections.offeringId) || offerings[0] || null;
    const fallbackIndustry = findIndustry(fallbackOffering, desiredSelections.industryId) || fallbackOffering?.industries?.[0] || null;
    const fallbackSubIndustry = findSubIndustry(fallbackIndustry, desiredSelections.subIndustryId) || fallbackIndustry?.subIndustries?.[0] || null;
    const fallbackPersona = findPersona(fallbackSubIndustry, desiredSelections.personaId) || fallbackSubIndustry?.personas?.[0] || null;

    return {
      offeringId: fallbackOffering?.id || '',
      industryId: fallbackIndustry?.id || '',
      subIndustryId: fallbackSubIndustry?.id || '',
      personaId: fallbackPersona?.id || ''
    };
  }

  buildOfferings() {
    return (personaLibraryDefinition.offerings || []).map((offering) => ({
      id: offering.id,
      name: offering.name,
      description: offering.description,
      industries: (offering.industries || []).map((industry) => ({
        id: industry.id,
        name: industry.name,
        subIndustries: (industry.subIndustries || []).map((subIndustry) => ({
          id: subIndustry.id,
          name: subIndustry.name,
          personas: (subIndustry.personas || [])
            .map((personaId) => {
              const persona = this.personas[personaId];

              if (!persona) {
                console.warn(`Persona ${personaId} referenced in library but not present in manifest data.`);
                return null;
              }

              return {
                id: personaId,
                title: persona.role,
                persona
              };
            })
            .filter(Boolean)
        }))
      }))
    }));
  }

  async loadPersonaLibrary(companyDomain) {
    await this.ensurePersonasLoaded();

    const normalizedDomain = this.normalizeDomain(companyDomain);
    const cacheKey = normalizedDomain || '__default__';

    if (this.libraryCache.has(cacheKey)) {
      return this.libraryCache.get(cacheKey);
    }

    const offerings = this.buildOfferings();
    const overrideSelections = this.resolveDomainOverride(normalizedDomain);

    const combinedSelections = {
      ...personaLibraryDefinition.defaultSelections,
      ...overrideSelections
    };

    const defaultSelections = this.sanitizeSelections(offerings, combinedSelections);

    const payload = {
      metadata: personaLibraryDefinition.metadata || {},
      personas: this.personas,
      offerings,
      defaultSelections,
      domain: normalizedDomain
    };

    this.libraryCache.set(cacheKey, payload);
    return payload;
  }
}

// Create singleton instance
export const personaLoader = new PersonaLoader();