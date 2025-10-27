# Documentation Index

Welcome to the Food Tracker App documentation! This directory contains comprehensive technical documentation for the project.

## 📚 Documentation Structure

### Core Documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Complete technical architecture overview
  - System architecture diagrams
  - Technology stack decisions
  - Performance considerations
  - Component hierarchies

### Technical Decisions
- **[TECHNICAL_DECISIONS.md](./TECHNICAL_DECISIONS.md)** - Decision records (TDRs)
  - Major architectural choices
  - Alternative evaluations
  - Rationale and trade-offs
  - Future decision template

### Component Documentation
- **[COMPONENT_DIAGRAMS.md](./COMPONENT_DIAGRAMS.md)** - Visual component architecture
  - Component structure diagrams
  - Integration flows
  - Development roadmap
  - Enhancement plans

## 🏗️ Quick Architecture Overview


## � Project Structure

## �🔧 For Developers

### Getting Started
1. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system overview
2. Check [TECHNICAL_DECISIONS.md](./TECHNICAL_DECISIONS.md) for context
3. Review [COMPONENT_DIAGRAMS.md](./COMPONENT_DIAGRAMS.md) for implementation details

### Making Changes
- Update relevant documentation when making architectural changes
- Add new TDRs for major decisions
- Keep diagrams current with implementation

### Documentation Standards
- Use Mermaid for all diagrams
- Follow existing TDR template
- Include rationale for decisions
- Update roadmaps as features complete

## 📋 Document Maintenance

| Document | Update Trigger | Frequency |
|----------|---------------|-----------|
| ARCHITECTURE.md | New major features, tech stack changes | As needed |
| TECHNICAL_DECISIONS.md | Major technical decisions | Per decision |
| COMPONENT_DIAGRAMS.md | New components, UI changes | Sprint cycles |

## 🚀 TODO: Future Features

### Personalized Calorie Recommendations

Currently, the progress chart shows a hardcoded target of 2,500 calories for a 6ft 30-year-old man. To implement personalized calorie calculations, we need to gather the following essential data points from users:

#### Essential Data Points Required:
1. **Weight** - Most critical factor for BMR calculation (e.g., 180 lbs / 82 kg)
2. **Height** - Already demonstrated (e.g., 6ft / 183 cm)  
3. **Age** - Already demonstrated (e.g., 30 years)
4. **Sex** - Already demonstrated (male/female/other)
5. **Activity Level** - Key multiplier for daily calorie needs:
   - **Sedentary (1.2x)**: Little/no exercise, desk job
   - **Lightly Active (1.375x)**: Light exercise 1-3 days/week
   - **Moderately Active (1.55x)**: Moderate exercise 3-5 days/week  
   - **Very Active (1.725x)**: Hard exercise 6-7 days/week
   - **Extremely Active (1.9x)**: Very hard exercise + physical job

#### Optional Enhancement Data:
6. **Goal** - Affects final target calculation:
   - **Maintain weight**: BMR × Activity Level
   - **Lose weight**: Subtract 300-500 calories 
   - **Gain weight**: Add 300-500 calories
7. **Body Composition** - Muscle mass affects metabolism (advanced feature)

#### Implementation Notes:
- Use **Mifflin-St Jeor equation** for BMR calculation
- **BMR Formula (men)**: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
- **BMR Formula (women)**: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
- **Daily Calories**: BMR × Activity Level × Goal Modifier

---

*Last updated: October 2025*
