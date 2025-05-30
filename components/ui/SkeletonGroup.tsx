// labwatch-app/components/ui/SkeletonGroup.tsx
import React from 'react';

interface SkeletonGroupProps {
  loading: boolean;
  skeleton: React.ReactNode;
  children: React.ReactNode;
}

/**
 * SkeletonGroup - A utility component to conditionally render skeleton loading state or content
 * 
 * @example
 * ```tsx
 * <SkeletonGroup
 *   loading={isLoading}
 *   skeleton={
 *     <View style={styles.container}>
 *       <Skeleton variant="circle" width={50} height={50} />
 *       <Skeleton variant="text" width="80%" style={{marginTop: 8}} />
 *       <Skeleton variant="text" width="60%" style={{marginTop: 4}} />
 *     </View>
 *   }
 * >
 *   <UserProfile user={userData} />
 * </SkeletonGroup>
 * ```
 */
export default function SkeletonGroup({ loading, skeleton, children }: SkeletonGroupProps) {
  return (
    <>
      {loading ? skeleton : children}
    </>
  );
}
