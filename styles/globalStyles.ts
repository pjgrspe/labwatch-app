// labwatch-app/styles/globalStyles.ts
import { Layout } from '@/constants';
import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    paddingHorizontal: Layout.spacing.lg,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  fullHeight: {
    height: '100%',
  },
  
  // Spacing helpers
  m0: { margin: 0 },
  m1: { margin: Layout.spacing.xs },
  m2: { margin: Layout.spacing.sm },
  m3: { margin: Layout.spacing.md },
  m4: { margin: Layout.spacing.lg },
  m5: { margin: Layout.spacing.xl },

  mt0: { marginTop: 0 },
  mt1: { marginTop: Layout.spacing.xs },
  mt2: { marginTop: Layout.spacing.sm },
  mt3: { marginTop: Layout.spacing.md },
  mt4: { marginTop: Layout.spacing.lg },
  mt5: { marginTop: Layout.spacing.xl },

  mb0: { marginBottom: 0 },
  mb1: { marginBottom: Layout.spacing.xs },
  mb2: { marginBottom: Layout.spacing.sm },
  mb3: { marginBottom: Layout.spacing.md },
  mb4: { marginBottom: Layout.spacing.lg },
  mb5: { marginBottom: Layout.spacing.xl },

  ml0: { marginLeft: 0 },
  ml1: { marginLeft: Layout.spacing.xs },
  ml2: { marginLeft: Layout.spacing.sm },
  ml3: { marginLeft: Layout.spacing.md },
  ml4: { marginLeft: Layout.spacing.lg },
  ml5: { marginLeft: Layout.spacing.xl },

  mr0: { marginRight: 0 },
  mr1: { marginRight: Layout.spacing.xs },
  mr2: { marginRight: Layout.spacing.sm },
  mr3: { marginRight: Layout.spacing.md },
  mr4: { marginRight: Layout.spacing.lg },
  mr5: { marginRight: Layout.spacing.xl },

  mx0: { marginHorizontal: 0 },
  mx1: { marginHorizontal: Layout.spacing.xs },
  mx2: { marginHorizontal: Layout.spacing.sm },
  mx3: { marginHorizontal: Layout.spacing.md },
  mx4: { marginHorizontal: Layout.spacing.lg },
  mx5: { marginHorizontal: Layout.spacing.xl },

  my0: { marginVertical: 0 },
  my1: { marginVertical: Layout.spacing.xs },
  my2: { marginVertical: Layout.spacing.sm },
  my3: { marginVertical: Layout.spacing.md },
  my4: { marginVertical: Layout.spacing.lg },
  my5: { marginVertical: Layout.spacing.xl },

  p0: { padding: 0 },
  p1: { padding: Layout.spacing.xs },
  p2: { padding: Layout.spacing.sm },
  p3: { padding: Layout.spacing.md },
  p4: { padding: Layout.spacing.lg },
  p5: { padding: Layout.spacing.xl },

  pt0: { paddingTop: 0 },
  pt1: { paddingTop: Layout.spacing.xs },
  pt2: { paddingTop: Layout.spacing.sm },
  pt3: { paddingTop: Layout.spacing.md },
  pt4: { paddingTop: Layout.spacing.lg },
  pt5: { paddingTop: Layout.spacing.xl },

  pb0: { paddingBottom: 0 },
  pb1: { paddingBottom: Layout.spacing.xs },
  pb2: { paddingBottom: Layout.spacing.sm },
  pb3: { paddingBottom: Layout.spacing.md },
  pb4: { paddingBottom: Layout.spacing.lg },
  pb5: { paddingBottom: Layout.spacing.xl },

  pl0: { paddingLeft: 0 },
  pl1: { paddingLeft: Layout.spacing.xs },
  pl2: { paddingLeft: Layout.spacing.sm },
  pl3: { paddingLeft: Layout.spacing.md },
  pl4: { paddingLeft: Layout.spacing.lg },
  pl5: { paddingLeft: Layout.spacing.xl },

  pr0: { paddingRight: 0 },
  pr1: { paddingRight: Layout.spacing.xs },
  pr2: { paddingRight: Layout.spacing.sm },
  pr3: { paddingRight: Layout.spacing.md },
  pr4: { paddingRight: Layout.spacing.lg },
  pr5: { paddingRight: Layout.spacing.xl },

  px0: { paddingHorizontal: 0 },
  px1: { paddingHorizontal: Layout.spacing.xs },
  px2: { paddingHorizontal: Layout.spacing.sm },
  px3: { paddingHorizontal: Layout.spacing.md },
  px4: { paddingHorizontal: Layout.spacing.lg },
  px5: { paddingHorizontal: Layout.spacing.xl },

  py0: { paddingVertical: 0 },
  py1: { paddingVertical: Layout.spacing.xs },
  py2: { paddingVertical: Layout.spacing.sm },
  py3: { paddingVertical: Layout.spacing.md },
  py4: { paddingVertical: Layout.spacing.lg },
  py5: { paddingVertical: Layout.spacing.xl },

  // Flex helpers
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
  },
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  columnReverse: {
    flexDirection: 'column-reverse',
  },
  flexWrap: {
    flexWrap: 'wrap',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  justifyBetween: {
    justifyContent: 'space-between',
  },
  justifyAround: {
    justifyContent: 'space-around',
  },
  justifyEvenly: {
    justifyContent: 'space-evenly',
  },
  alignStart: {
    alignItems: 'flex-start',
  },
  alignCenter: {
    alignItems: 'center',
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  alignStretch: {
    alignItems: 'stretch',
  },
  flex1: {
    flex: 1,
  },
  flexGrow: {
    flexGrow: 1,
  },
  flexShrink: {
    flexShrink: 1,
  },
  
  // Position helpers
  relative: {
    position: 'relative',
  },
  absolute: {
    position: 'absolute',
  },
  absoluteFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  // Border radius helpers
  roundedSm: {
    borderRadius: Layout.borderRadius.sm,
  },
  roundedMd: {
    borderRadius: Layout.borderRadius.md,
  },
  roundedLg: {
    borderRadius: Layout.borderRadius.lg,
  },
  roundedPill: {
    borderRadius: Layout.borderRadius.pill,
  },
  
  // Form helpers
  formGroup: {
    marginBottom: Layout.spacing.md,
  },
  formLabel: {
    marginBottom: Layout.spacing.xs,
    fontSize: Layout.fontSize.sm,
  },
  
  // Text alignment
  textCenter: {
    textAlign: 'center',
  },
  textLeft: {
    textAlign: 'left',
  },
  textRight: {
    textAlign: 'right',
  },
  
  // Misc utilities
  shadow: {
    ...Layout.cardShadow,
  },
  hidden: {
    display: 'none',
  },
  overflowHidden: {
    overflow: 'hidden',
  },
});

export default globalStyles;