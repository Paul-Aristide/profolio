// src/lib/cv/CvDocument.tsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Image,
} from '@react-pdf/renderer';

// Couleurs selon la charte graphique ProFolio
const COLORS = {
  navy: '#0a1628',
  white: '#FFFFFF',
  blueBright: '#00E5FF',
  blueLight: '#00BFFF',
  blueSky: '#87CEEB',
  purple: '#B388FF',
  purpleLight: '#D1C4E9',
  silver: '#D9D9D9',
  gray: '#555555',
  lightGray: '#F8F9FA',
  cardGray: '#E9ECEF',
  textDark: '#0a1628',
  textLight: '#374151',
  textLighter: '#6B7280',
};

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.textLight,
    backgroundColor: COLORS.white,
    padding: 0,
    margin: 0,
  },
  header: {
    background: `linear-gradient(135deg, ${COLORS.navy}, #1a2b48)`,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 30,
    position: 'relative',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  photoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: COLORS.blueBright,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    marginRight: 30,
  },
  photoImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  photoInitials: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.blueBright,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    color: COLORS.white,
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    lineHeight: 100,
  },
  headerText: {
    flexDirection: 'column',
    flex: 1,
  },
  name: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    letterSpacing: 2,
    marginBottom: 5,
  },
  expertise: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.blueBright,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  personalInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  personalInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  personalInfoText: {
    fontSize: 9,
    color: COLORS.white,
    lineHeight: 1.4,
  },
  waveWrap: {
    position: 'relative',
    height: 40,
    marginTop: -1,
  },
  waveSvg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 595,
    height: 40,
  },
  body: {
    flexDirection: 'row',
    paddingHorizontal: 40,
    paddingTop: 30,
    paddingBottom: 40,
    gap: 25,
  },
  sidebar: {
    width: '30%',
    paddingRight: 15,
  },
  main: {
    width: '70%',
    paddingLeft: 15,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.blueBright,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.blueBright,
  },
  sidebarSection: {
    marginBottom: 20,
  },
  sidebarTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.blueBright,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.blueBright,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  contactText: {
    fontSize: 9,
    color: COLORS.textDark,
    lineHeight: 1.4,
    flex: 1,
  },
  skillItem: {
    marginBottom: 10,
  },
  skillName: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.textDark,
    marginBottom: 3,
  },
  skillBarContainer: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.cardGray,
    overflow: 'hidden',
  },
  skillBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.blueBright,
  },
  tag: {
    backgroundColor: COLORS.blueBright + '20',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 8,
    color: COLORS.blueBright,
    fontFamily: 'Helvetica-Bold',
    marginRight: 5,
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  entry: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardGray,
  },
  entryNoBorder: {
    marginBottom: 15,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  entryTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.textDark,
    flex: 1,
  },
  entrySubtitle: {
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: COLORS.textLighter,
    marginBottom: 3,
  },
  entryPeriod: {
    fontSize: 9,
    color: COLORS.purple,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  },
  entryDescription: {
    fontSize: 9.5,
    color: COLORS.textLight,
    lineHeight: 1.5,
    marginTop: 3,
  },
  contentSection: {
    marginBottom: 20,
  },
  contentSectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.blueBright,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.blueBright,
  },
  socialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  socialLink: {
    fontSize: 9,
    color: COLORS.purple,
    fontFamily: 'Helvetica',
  },
});

type CvData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  birthDate: string | null;
  birthPlace: string | null;
  username: string;
  profile: {
    bio: string | null;
    expertise: string | null;
    city: string | null;
    country: string | null;
    neighborhood: string | null;
    maritalStatus: string | null;
    hobbies: string[];
    profilePhoto: string | null;
    githubUrl: string | null;
    facebookUrl: string | null;
    youtubeUrl: string | null;
    linkedinUrl: string | null;
    whatsappUrl: string | null;
    instagramUrl: string | null;
  } | null;
  formations: {
    title: string;
    institution: string;
    year: number;
    description: string | null;
    photo: string | null;
  }[];
  experiences: {
    title: string;
    company: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string | null;
    logo: string | null;
  }[];
  skills: {
    category: string;
    title: string;
    description: string | null;
  }[];
};

function initials(firstName: string, lastName: string) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatPeriod(startDate: string, endDate: string | null, current: boolean): string {
  const start = formatDate(startDate);
  if (current || !endDate) {
    return `${start} - Présent`;
  }
  return `${start} - ${formatDate(endDate)}`;
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.sidebarSection}>
      <Text style={styles.sidebarTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Entry({
  title,
  subtitle,
  period,
  description,
  hasBorder = true,
}: {
  title: string;
  subtitle?: string;
  period?: string;
  description?: string | null;
  hasBorder?: boolean;
}) {
  return (
    <View style={hasBorder ? styles.entry : styles.entryNoBorder}>
      <View style={styles.entryHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.entryTitle}>{title}</Text>
          {subtitle && <Text style={styles.entrySubtitle}>{subtitle}</Text>}
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          {period && <Text style={styles.entryPeriod}>{period}</Text>}
        </View>
      </View>
      {description && <Text style={styles.entryDescription}>{description}</Text>}
    </View>
  );
}

function SkillItem({ title, level = 80 }: { title: string; level?: number }) {
  return (
    <View style={styles.skillItem}>
      <Text style={styles.skillName}>{title}</Text>
      <View style={styles.skillBarContainer}>
        <View style={[styles.skillBarFill, { width: `${level}%` }]} />
      </View>
    </View>
  );
}

export function CvDocument({ data }: { data: CvData }) {
  const acquisSkills = data.skills.filter((s) => s.category === 'acquis');
  const posteViseSkills = data.skills.filter((s) => s.category === 'poste_vise');
  const domaineSkills = data.skills.filter((s) => s.category === 'domaine_formation');

  const profile = data.profile || null;
  const hasSocial = profile && (
    profile.githubUrl || profile.facebookUrl || profile.linkedinUrl || 
    profile.youtubeUrl || profile.instagramUrl || profile.whatsappUrl
  );

  const socialPlatforms = [
    { key: 'linkedin', name: 'LinkedIn', url: profile?.linkedinUrl, icon: '💼' },
    { key: 'github', name: 'GitHub', url: profile?.githubUrl, icon: '💻' },
    { key: 'facebook', name: 'Facebook', url: profile?.facebookUrl, icon: '📘' },
    { key: 'youtube', name: 'YouTube', url: profile?.youtubeUrl, icon: '📺' },
    { key: 'instagram', name: 'Instagram', url: profile?.instagramUrl, icon: '📷' },
    { key: 'whatsapp', name: 'WhatsApp', url: profile?.whatsappUrl, icon: '💬' },
  ].filter(p => p.url);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.photoContainer}>
              {profile?.profilePhoto ? (
                <Image src={profile.profilePhoto} style={styles.photoImage} />
              ) : (
                <Text style={styles.photoInitials}>{initials(data.firstName, data.lastName)}</Text>
              )}
            </View>
            <View style={styles.headerText}>
              <Text style={styles.name}>{data.firstName} {data.lastName}</Text>
              {profile?.expertise && <Text style={styles.expertise}>{profile.expertise}</Text>}
            </View>
          </View>
        </View>

        <View style={styles.waveWrap}>
          <Svg style={styles.waveSvg} viewBox="0 0 595 40" preserveAspectRatio="none">
            <Path d="M0,0 L595,0 L595,30 C480,44 350,12 250,26 C150,40 80,18 0,28 Z" fill={COLORS.purple} />
            <Path d="M0,0 L595,0 L595,22 C520,30 420,14 320,22 C220,30 140,16 0,22 Z" fill={COLORS.white} />
            <Path d="M0,0 L595,0 L595,6 C500,10 400,4 300,8 C200,12 100,6 0,8 Z" fill={COLORS.blueSky} />
          </Svg>
        </View>

        <View style={styles.body}>
          <View style={styles.sidebar}>
            <SidebarSection title="Contact">
              <View style={styles.contactItem}>
                <Text>📧</Text>
                <Text style={styles.contactText}>{data.email}</Text>
              </View>
              {data.phone && data.phone.trim() && (
                <View style={styles.contactItem}>
                  <Text>📞</Text>
                  <Text style={styles.contactText}>{data.phone}</Text>
                </View>
              )}
              {(profile?.city || profile?.country) && (
                <View style={styles.contactItem}>
                  <Text>📍</Text>
                  <Text style={styles.contactText}>
                    {profile?.city}{profile?.country ? `, ${profile.country}` : ''}
                    {profile?.neighborhood ? ` (${profile.neighborhood})` : ''}
                  </Text>
                </View>
              )}
              {profile?.maritalStatus && (
                <View style={styles.contactItem}>
                  <Text>💍</Text>
                  <Text style={styles.contactText}>{profile.maritalStatus}</Text>
                </View>
              )}
              <View style={styles.contactItem}>
                <Text>🔗</Text>
                <Text style={[styles.contactText, { fontSize: 8 }]}>profolio.onrender.com/u/{data.username}</Text>
              </View>
            </SidebarSection>

            {hasSocial && (
              <SidebarSection title="Réseaux Sociaux">
                {socialPlatforms.map((platform) => (
                  <View key={platform.key} style={styles.socialItem}>
                    <Text>{platform.icon}</Text>
                    <Text style={styles.socialLink}>{platform.name}</Text>
                  </View>
                ))}
              </SidebarSection>
            )}

            {acquisSkills.length > 0 && (
              <SidebarSection title="Compétences">
                {acquisSkills.map((skill, index) => (
                  <SkillItem key={index} title={skill.title} level={80 + (index % 20)} />
                ))}
              </SidebarSection>
            )}

            {posteViseSkills.length > 0 && (
              <SidebarSection title="Postes Visés">
                <View style={styles.tagRow}>
                  {posteViseSkills.map((skill, index) => (
                    <Text key={index} style={styles.tag}>{skill.title}</Text>
                  ))}
                </View>
              </SidebarSection>
            )}

            {domaineSkills.length > 0 && (
              <SidebarSection title="Domaines">
                <View style={styles.tagRow}>
                  {domaineSkills.map((skill, index) => (
                    <Text key={index} style={[styles.tag, { backgroundColor: COLORS.purple + '20', color: COLORS.purple }]}>
                      {skill.title}
                    </Text>
                  ))}
                </View>
              </SidebarSection>
            )}

            {profile?.hobbies && profile.hobbies.length > 0 && (
              <SidebarSection title="Loisirs">
                <View style={styles.tagRow}>
                  {profile.hobbies.map((hobby, index) => (
                    <Text key={index} style={[styles.tag, { backgroundColor: COLORS.blueSky + '30', color: COLORS.blueSky }]}>
                      {hobby}
                    </Text>
                  ))}
                </View>
              </SidebarSection>
            )}
          </View>

          <View style={styles.main}>
            {profile?.bio && (
              <View style={styles.contentSection}>
                <Text style={styles.contentSectionTitle}>Profil Professionnel</Text>
                <Text style={[styles.entryDescription, { fontSize: 10.5, lineHeight: 1.6 }]}>{profile.bio}</Text>
              </View>
            )}

            {data.experiences && data.experiences.length > 0 && (
              <View style={styles.contentSection}>
                <Text style={styles.contentSectionTitle}>Expérience Professionnelle</Text>
                {data.experiences.map((exp, index) => (
                  <Entry
                    key={index}
                    title={exp.title}
                    subtitle={exp.company}
                    period={formatPeriod(exp.startDate, exp.endDate, exp.current)}
                    description={exp.description}
                  />
                ))}
              </View>
            )}

            {data.formations.length > 0 && (
              <View style={styles.contentSection}>
                <Text style={styles.contentSectionTitle}>Formation</Text>
                {data.formations.map((formation, index) => (
                  <Entry
                    key={index}
                    title={formation.title}
                    subtitle={`${formation.institution} - ${formation.year}`}
                    description={formation.description}
                  />
                ))}
              </View>
            )}

            {(!data.experiences || data.experiences.length === 0) && 
             data.formations.length === 0 && 
             !profile?.bio && (
              <View style={styles.contentSection}>
                <Text style={[styles.entryDescription, { fontStyle: 'italic', color: COLORS.textLighter }]}>
                  Ajoutez vos expériences et formations via votre tableau de bord.
                </Text>
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
