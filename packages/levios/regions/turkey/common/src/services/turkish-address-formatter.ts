import {
  IAddressFormatter,
  Address,
  AddressValidationResult,
  AddressFormatOptions,
} from "@levios/framework"
import { TurkishCity, TurkishDistrict } from "../types"

/**
 * Turkish cities (iller) - major cities for demo
 * In production, this would be a complete list
 */
const TURKISH_CITIES: TurkishCity[] = [
  { code: "34", name: "Istanbul", plateCode: 34 },
  { code: "06", name: "Ankara", plateCode: 6 },
  { code: "35", name: "Izmir", plateCode: 35 },
  { code: "16", name: "Bursa", plateCode: 16 },
  { code: "07", name: "Antalya", plateCode: 7 },
  { code: "01", name: "Adana", plateCode: 1 },
  { code: "42", name: "Konya", plateCode: 42 },
  { code: "21", name: "Diyarbakir", plateCode: 21 },
  { code: "27", name: "Gaziantep", plateCode: 27 },
  { code: "41", name: "Kocaeli", plateCode: 41 },
]

/**
 * Turkish districts (ilceler) - sample districts for major cities
 */
const TURKISH_DISTRICTS: TurkishDistrict[] = [
  // Istanbul
  { code: "34-kadikoy", name: "Kadikoy", cityCode: "34" },
  { code: "34-besiktas", name: "Besiktas", cityCode: "34" },
  { code: "34-sisli", name: "Sisli", cityCode: "34" },
  { code: "34-uskudar", name: "Uskudar", cityCode: "34" },
  { code: "34-bakirkoy", name: "Bakirkoy", cityCode: "34" },
  // Ankara
  { code: "06-cankaya", name: "Cankaya", cityCode: "06" },
  { code: "06-kecioren", name: "Kecioren", cityCode: "06" },
  { code: "06-mamak", name: "Mamak", cityCode: "06" },
  // Izmir
  { code: "35-konak", name: "Konak", cityCode: "35" },
  { code: "35-bornova", name: "Bornova", cityCode: "35" },
  { code: "35-karsiyaka", name: "Karsiyaka", cityCode: "35" },
]

/**
 * Turkish Address Formatter
 * Handles Turkish address formatting and validation
 */
export class TurkishAddressFormatter implements IAddressFormatter {
  /**
   * Validate a Turkish address
   */
  validate(address: Address): AddressValidationResult {
    const errors: Record<string, string> = {}

    // Validate country code
    if (address.countryCode?.toUpperCase() !== "TR") {
      errors.countryCode = "Country code must be TR for Turkish addresses"
    }

    // Validate required fields
    if (!address.address1?.trim()) {
      errors.address1 = "Address line 1 is required"
    }

    if (!address.city?.trim()) {
      errors.city = "City (il) is required"
    }

    if (!address.district?.trim()) {
      errors.district = "District (ilce) is required"
    }

    // Validate city
    if (address.city) {
      const city = this.findCity(address.city)
      if (!city) {
        errors.city = "Invalid city name"
      }
    }

    // Validate postal code format (5 digits)
    if (address.postalCode) {
      if (!/^\d{5}$/.test(address.postalCode)) {
        errors.postalCode = "Postal code must be 5 digits"
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      normalizedAddress: Object.keys(errors).length === 0
        ? this.normalizeAddress(address)
        : undefined,
    }
  }

  /**
   * Format a Turkish address for display
   */
  format(address: Address, options?: AddressFormatOptions): string {
    const lines = this.formatLines(address, options)
    return options?.style === "single_line"
      ? lines.join(", ")
      : lines.join("\n")
  }

  /**
   * Format address as multiple lines
   */
  formatLines(address: Address, options?: AddressFormatOptions): string[] {
    const lines: string[] = []

    // Line 1: Street address
    lines.push(address.address1)
    if (address.address2) {
      lines.push(address.address2)
    }

    // Line 2: Neighborhood (Mahalle) if present
    if (address.district) {
      lines.push(address.district)
    }

    // Line 3: City and postal code
    const cityLine = `${address.postalCode || ""} ${address.city || ""}`.trim()
    if (cityLine) {
      lines.push(cityLine)
    }

    // Line 4: Country (if requested)
    if (options?.includeCountry) {
      lines.push("Turkiye")
    }

    return lines.filter(Boolean)
  }

  /**
   * Parse an address string into structured format
   */
  parse(addressString: string): Address | null {
    // Basic parsing - in production, this would be more sophisticated
    const lines = addressString.split(/[,\n]/).map((l) => l.trim())

    if (lines.length < 2) {
      return null
    }

    return {
      address1: lines[0],
      address2: lines.length > 3 ? lines[1] : undefined,
      district: lines.length > 2 ? lines[lines.length - 2] : "",
      city: lines[lines.length - 1],
      postalCode: "",
      countryCode: "TR",
    }
  }

  /**
   * Get all Turkish provinces (cities/iller)
   */
  getProvinces(): Array<{ code: string; name: string }> {
    return TURKISH_CITIES.map((c) => ({
      code: c.code,
      name: c.name,
    }))
  }

  /**
   * Get districts for a province
   */
  getCities(provinceCode: string): Array<{ code: string; name: string }> {
    return TURKISH_DISTRICTS
      .filter((d) => d.cityCode === provinceCode)
      .map((d) => ({
        code: d.code,
        name: d.name,
      }))
  }

  /**
   * Get districts for a city (alias for getCities in Turkish context)
   */
  getDistricts(cityCode: string): Array<{ code: string; name: string }> {
    return this.getCities(cityCode)
  }

  /**
   * Find city by name or code
   */
  private findCity(nameOrCode: string): TurkishCity | undefined {
    const normalized = nameOrCode.toLowerCase().trim()
    return TURKISH_CITIES.find(
      (c) =>
        c.code === nameOrCode ||
        c.name.toLowerCase() === normalized ||
        c.plateCode.toString() === nameOrCode
    )
  }

  /**
   * Normalize address data
   */
  private normalizeAddress(address: Address): Address {
    const city = this.findCity(address.city)

    return {
      ...address,
      city: city?.name || address.city,
      countryCode: "TR",
    }
  }
}

export default TurkishAddressFormatter
