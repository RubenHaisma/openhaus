# Real Data Integration Setup Guide

This guide explains how to set up real data sources for the OpenHaus platform, replacing all mock data with actual European property, tax, and financial data.

## Required API Keys and Accounts

### 1. Dutch Property Data (Kadaster)
- **Service**: Kadaster BAG API
- **Purpose**: Property addresses, building data, coordinates
- **Registration**: https://www.kadaster.nl/zakelijk/producten/adressen-en-gebouwen/bag-api
- **Cost**: €0.05 per request
- **Environment Variable**: `KADASTER_API_KEY`

### 2. WOZ Valuation Data
- **Service**: Municipal WOZ APIs
- **Purpose**: Official property valuations
- **Registration**: Contact local municipalities or use aggregator services
- **Cost**: Varies by municipality
- **Environment Variable**: `WOZ_API_KEY`

### 3. Market Data (NVM)
- **Service**: Nederlandse Vereniging van Makelaars
- **Purpose**: Recent sales, market trends
- **Registration**: https://www.nvm.nl/voor-professionals/nvm-api
- **Cost**: €500/month for basic access
- **Environment Variable**: `NVM_API_KEY`

### 4. Statistics Netherlands (CBS)
- **Service**: CBS Open Data API
- **Purpose**: Market trends, regional statistics
- **Registration**: https://opendata.cbs.nl/
- **Cost**: Free
- **Environment Variable**: `CBS_API_KEY` (optional)

### 5. Tax Data (Belastingdienst)
- **Service**: Dutch Tax Authority API
- **Purpose**: Current tax rates, transfer tax
- **Registration**: https://www.belastingdienst.nl/wps/wcm/connect/nl/ontwikkelaars/
- **Cost**: Free for basic rates
- **Environment Variable**: `BELASTINGDIENST_API_KEY`

### 6. Mortgage Data (NHG)
- **Service**: Nationale Hypotheek Garantie
- **Purpose**: Mortgage limits, financing ratios
- **Registration**: https://www.nhg.nl/professionals/
- **Cost**: Free for basic data
- **Environment Variable**: `NHG_API_KEY`

### 7. Energy Labels (EP-Online)
- **Service**: EP-Online Database
- **Purpose**: Energy performance certificates
- **Registration**: https://www.ep-online.nl/
- **Cost**: €0.10 per query
- **Environment Variable**: `EP_ONLINE_API_KEY`

### 8. Energy Advice (RVO)
- **Service**: Rijksdienst voor Ondernemend Nederland
- **Purpose**: Energy improvement recommendations
- **Registration**: https://www.rvo.nl/onderwerpen/duurzaam-ondernemen/
- **Cost**: Free for basic data
- **Environment Variable**: `RVO_API_KEY`

## Setup Instructions

### 1. Environment Configuration
Copy `.env.example` to `.env.local` and fill in all required API keys:

```bash
cp .env.example .env.local
```

### 2. API Key Registration Process

#### Kadaster API Setup
1. Visit https://www.kadaster.nl/zakelijk/producten/adressen-en-gebouwen/bag-api
2. Create a business account
3. Subscribe to BAG API service
4. Generate API key
5. Add to environment: `KADASTER_API_KEY=your_key_here`

#### NVM API Setup
1. Contact NVM at https://www.nvm.nl/contact
2. Request API access (requires NVM membership or partnership)
3. Complete technical integration requirements
4. Receive API credentials
5. Add to environment: `NVM_API_KEY=your_key_here`

#### EP-Online Setup
1. Register at https://www.ep-online.nl/
2. Request API access for energy label data
3. Complete data processing agreement (GDPR)
4. Receive API credentials
5. Add to environment: `EP_ONLINE_API_KEY=your_key_here`

### 3. Testing Real Data Integration

Run the test suite to verify all APIs are working:

```bash
npm run test:real-data
```

### 4. Rate Limiting and Caching

The platform implements intelligent caching to minimize API costs:

- **Kadaster data**: Cached for 24 hours
- **Market data**: Cached for 1 hour
- **Tax rates**: Cached for 1 week
- **Energy data**: Cached for 30 days

### 5. Error Handling

All real data integrations include fallback mechanisms:

1. **Primary API failure**: Retry with exponential backoff
2. **Secondary failure**: Use cached data if available
3. **Complete failure**: Return error to user with explanation

## Cost Estimation

### Monthly API Costs (estimated for 1000 valuations/month)

| Service | Cost per Request | Monthly Cost |
|---------|------------------|--------------|
| Kadaster BAG | €0.05 | €50 |
| EP-Online | €0.10 | €100 |
| NVM Market Data | Subscription | €500 |
| **Total** | | **€650/month** |

### Cost Optimization Strategies

1. **Intelligent Caching**: Reduce repeat requests by 80%
2. **Batch Processing**: Group requests where possible
3. **Selective Updates**: Only refresh data when necessary
4. **User Limits**: Implement rate limiting per user

## Data Quality and Validation

### Automatic Data Validation
- Cross-reference multiple sources
- Flag inconsistencies for manual review
- Maintain data quality scores
- Regular accuracy audits

### Manual Overrides
- Allow manual corrections for edge cases
- Maintain audit trail of changes
- Regular review of override patterns

## Compliance and Legal

### GDPR Compliance
- All data processing agreements in place
- User consent for data collection
- Right to deletion implementation
- Data retention policies

### Financial Regulations
- Comply with Dutch financial services law
- Accurate tax calculations
- Proper disclaimers for estimates

## Monitoring and Alerts

### API Health Monitoring
- Real-time API status dashboard
- Automatic failover to backup sources
- Alert system for API failures
- Performance metrics tracking

### Data Quality Monitoring
- Accuracy metrics vs. actual sales
- Confidence score calibration
- Regular model performance reviews

## Support and Maintenance

### Regular Updates
- Monthly review of API changes
- Quarterly accuracy assessments
- Annual contract renewals
- Continuous improvement process

### Emergency Procedures
- 24/7 monitoring for critical APIs
- Escalation procedures for failures
- Backup data sources ready
- Communication plan for outages

## Getting Help

For technical support with real data integration:

1. Check API documentation first
2. Review error logs in monitoring dashboard
3. Contact API providers directly for service issues
4. Escalate to development team for integration problems

## Next Steps

1. Complete API registrations
2. Set up monitoring and alerting
3. Run comprehensive testing
4. Deploy to staging environment
5. Conduct accuracy validation
6. Deploy to production with monitoring