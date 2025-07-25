# OpenHaus - Energy Transition Compliance Platform for Netherlands

A comprehensive digital platform helping Dutch property owners navigate the mandatory energy transition requirements, connect with certified contractors, and access government subsidies.

## 🚀 Features

- **Subsidy Eligibility & Application**: Automated checking and application for government energy subsidies
- **Certified Contractor Marketplace**: Vetted energy specialists for heat pumps, insulation, solar panels
- **Compliance Tracking**: Monitor progress toward 2030/2050 energy neutrality deadlines
- **ROI Calculator**: Calculate energy savings and payback periods for upgrades
- **Property Energy Assessment**: Detailed energy audits and improvement recommendations
- **Government Integration**: Direct integration with RVO, municipalities, and energy databases

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **Payments**: Stripe (for contractor services)
- **Energy Data**: RVO API, EP Online, CBS Energy Statistics
- **Monitoring**: Winston, Sentry

## 📊 Energy Data Sources

Our platform integrates with official Dutch energy transition data:

1. **RVO (Netherlands Enterprise Agency)**: Subsidy schemes and eligibility
2. **EP Online**: Energy labels and certificates
3. **CBS Energy Statistics**: National energy consumption data
4. **Municipal Energy Plans**: Local transition requirements
5. **Grid Operators**: Energy infrastructure data

### Benefits of integrated approach:
- ✅ **Real-time subsidy information** (€3B+ annual funding)
- ✅ **Certified contractor network** (verified specialists)
- ✅ **Compliance automation** reduces bureaucracy
- ✅ **ROI transparency** for energy investments
- ✅ **100% regulatory compliance** with Dutch energy laws

## 🚀 Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd OpenHaus
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
# Fill in your Supabase, RVO API, and EP Online credentials
```

4. **Run database migrations**
```bash
# Energy compliance tables will be created automatically
```

5. **Start the development server**
```bash
npm run dev
```

## 🗄️ Database Schema

### Energy Assessments
```sql
CREATE TABLE energy_assessments (
  id uuid PRIMARY KEY,
  property_address text NOT NULL,
  postal_code text NOT NULL,
  current_energy_label text NOT NULL,
  target_energy_label text NOT NULL,
  assessment_date timestamptz NOT NULL,
  recommendations jsonb NOT NULL,
  estimated_cost decimal(12,2),
  potential_savings decimal(12,2),
  compliance_deadline date,
  UNIQUE(property_address, postal_code)
);
```

### Subsidy Applications
```sql
CREATE TABLE subsidy_applications (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  property_id uuid REFERENCES properties(id),
  subsidy_scheme text NOT NULL,
  application_status text NOT NULL,
  amount_requested decimal(12,2),
  amount_approved decimal(12,2),
  application_date timestamptz NOT NULL,
  decision_date timestamptz,
  rvo_reference text
);
```

## 🔧 Configuration

### Energy Transition System

The platform is configured to:
- Track all Dutch energy transition requirements
- Monitor subsidy scheme updates from RVO
- Verify contractor certifications automatically
- Calculate ROI based on current energy prices
- Ensure compliance with municipal energy plans

### Contractor Marketplace Features

The platform provides:
- **Certified contractor directory** with verified credentials
- **Project matching** based on property type and requirements
- **Quote comparison** from multiple specialists
- **Quality assurance** through customer reviews and certifications
- **Project management** tools for tracking progress
- **Payment protection** through escrow services

## 📈 Performance

- **Fast subsidy checks**: Eligibility results in <2 seconds
- **Real-time data**: Live updates from RVO and energy databases
- **Smart matching**: AI-powered contractor recommendations
- **Compliance tracking**: Automated deadline monitoring

## 🔒 Security & Compliance

- **GDPR Compliant**: All data handling follows EU regulations
- **RVO Integration**: Official government data sources
- **Contractor Verification**: Multi-level certification checks
- **Secure Payments**: PCI DSS compliant payment processing
- **Audit Logging**: Complete compliance audit trail

## 🌍 Energy Transition Support

Ready for all Dutch energy requirements:
- 🇳🇱 Netherlands (Full RVO integration - implemented)
- 🏠 All property types (residential, commercial)
- ⚡ All energy measures (heat pumps, insulation, solar, etc.)
- 💰 All subsidy schemes (ISDE, SEEH, BEI, etc.)

## 📱 API Endpoints

### Energy Assessment
```
POST /api/energy/assessment
{
  "address": "Keizersgracht 123",
  "postalCode": "1015 CJ",
  "propertyType": "apartment",
  "currentHeating": "gas"
}
```

### Subsidy Eligibility
```
POST /api/subsidies/check
{
  "propertyId": "uuid",
  "measures": ["heat_pump", "insulation", "solar_panels"]
}
```

### Contractor Search
```
GET /api/contractors/search?location=Amsterdam&specialty=heat_pumps&certification=RVO
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@OpenHaus.nl or create an issue in this repository.

---

**Note**: This platform helps Dutch property owners comply with mandatory energy transition requirements while accessing government subsidies and certified contractors. All data integration follows official RVO and government guidelines.