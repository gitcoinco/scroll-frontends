import { BrowserProvider } from "ethers"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { isDesktop } from "react-device-detect"
import { Helmet } from "react-helmet-async"
import { Navigate, useNavigate, useParams } from "react-router-dom"

import Canvas from "@/components/Canvas"
// import { BADGES_VISIBLE_TYPE } from "@/constants"
import { useCanvasContext } from "@/contexts/CanvasContextProvider"
import { useRainbowContext } from "@/contexts/RainbowProvider"
import useSnackbar from "@/hooks/useSnackbar"
import { checkIfProfileMinted } from "@/services/canvasService"
import useCanvasStore from "@/stores/canvasStore"
import { requireEnv } from "@/utils"

import GridBg from "../components/GridBg"
import LoadingPage from "../loading"
import ActionBox from "./ActionBox"
import BadgeDetailDialog from "./BadgeDetailDialog"
import BadgeWall from "./BadgeWall"
import BadgesDialog from "./BadgesDialog"
import FirstBadgeMask from "./FirstBadgeMask"
import NameDialog from "./NameDialog"
import ReferDialog from "./ReferDialog"
import UpgradeDialog from "./UpgradeDialog"

const Dashboard = props => {
  const { walletCurrentAddress } = useRainbowContext()

  const { address: othersWalletAddress } = useParams()
  const navigate = useNavigate()

  const { unsignedProfileRegistryContract, publicProvider } = useCanvasContext()

  const {
    canvasUsername,
    attachedBadges,
    fetchCurrentCanvasDetail,
    fetchOthersCanvasDetail,
    profileAddress,
    changeProfileDetailLoading,
    profileDetailLoading,
    changeUpgradeDialog,
    badgeAnimationVisible,
    initialMint,
    upgradeDialogVisible,
    mintableBadges,
    pickMintableBadges,
    pickMintableBadgesLoading,
  } = useCanvasStore()

  const metadata = {
    title: `Scroll -  ${canvasUsername}'s Canvas`,
    description: "Hi, I've minted Scroll Canvas!",
    image: `${requireEnv("REACT_APP_CANVAS_BACKEND_URI")}/canvas/${othersWalletAddress || walletCurrentAddress}.png`,
  }

  useEffect(() => {
    // recheck badge eligibility when openning badges dialog
    if (upgradeDialogVisible) {
      pickMintableBadges(publicProvider, walletCurrentAddress, true)
    }
  }, [upgradeDialogVisible])

  const scrollyAlert = useMemo(() => {
    if (mintableBadges.length) {
      return {
        title: "Mint eligible badges",
        content: "Welcome to Scroll Canvas where you can earn badges across the ecosystem. Mint your badges now!",
        action: () => {
          changeUpgradeDialog(true)
        },
      }
    }
    return {
      title: "Explore badges",
      content: "Welcome to Scroll Canvas where you can earn badges across the ecosystem. Explore protocols offering badges now!",
      action: () => {
        navigate("/ecosystem")
      },
    }
  }, [mintableBadges.length])

  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  // TODO: fetchOther does not depend on a connected wallet
  useEffect(() => {
    if (unsignedProfileRegistryContract && othersWalletAddress) {
      fetchOthers(publicProvider, unsignedProfileRegistryContract, othersWalletAddress)
    }
  }, [unsignedProfileRegistryContract, othersWalletAddress])

  // must have minted
  useEffect(() => {
    if (publicProvider && publicProvider instanceof BrowserProvider && !othersWalletAddress && profileAddress && !initialMint) {
      fetchCurrent(publicProvider, walletCurrentAddress, profileAddress)
    }
  }, [publicProvider, othersWalletAddress, profileAddress, initialMint])

  const alertWarning = useSnackbar()

  const fetchCurrent = async (provider, walletAddress, profileAddress) => {
    try {
      changeProfileDetailLoading(true)
      const signer = await provider?.getSigner(0)
      await fetchCurrentCanvasDetail(signer, walletAddress, profileAddress)
      // initially check eligibility
      await pickMintableBadges(provider, walletAddress, true)
    } catch (e) {
      alertWarning(e.message)
    } finally {
      changeProfileDetailLoading(false)
    }
  }

  const fetchOthers = async (provider, unsignedProfileRegistryContract, othersWalletAddress) => {
    try {
      changeProfileDetailLoading(true)
      await checkAndFetchOthersCanvasDetail(provider, unsignedProfileRegistryContract, othersWalletAddress)
    } catch (e) {
      alertWarning(e.message)
    } finally {
      changeProfileDetailLoading(false)
    }
  }
  const checkAndFetchOthersCanvasDetail = async (provider, unsignedProfileRegistryContract, othersWalletAddress) => {
    const { minted, profileAddress } = await checkIfProfileMinted(unsignedProfileRegistryContract, othersWalletAddress)
    if (!minted) {
      navigate("/404")
      return
    }
    await fetchOthersCanvasDetail(provider, othersWalletAddress, profileAddress)
  }

  const handleResize = useCallback(() => {
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })
  }, [])

  useEffect(() => {
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [handleResize])

  const gridNum = useMemo(() => (attachedBadges.length > 12 ? 8 : 4), [attachedBadges])

  const badgewidth = useMemo(() => {
    const { width, height } = windowDimensions
    if (width < height - 62) {
      return (width - 62) / gridNum
    } else {
      return (height - 65 - 80) / gridNum
    }
  }, [windowDimensions, gridNum])

  if (othersWalletAddress === walletCurrentAddress) {
    return <Navigate to="/scroll-canvas" replace></Navigate>
  }
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:image" content={metadata.image} />
        <meta name="twitter:title" content={metadata.title} />
        <meta name="twitter:description" content={metadata.description} />
        <meta name="twitter:image" content={metadata.image} />
      </Helmet>
      {!!profileDetailLoading ? (
        <LoadingPage></LoadingPage>
      ) : (
        <GridBg badgewidth={badgewidth} gridNum={gridNum}>
          <BadgeWall badgewidth={badgewidth} gridNum={gridNum} windowDimensions={windowDimensions} />

          {isDesktop && !othersWalletAddress && (
            <Canvas visible buttonText={scrollyAlert.title} title={scrollyAlert.content} onClick={scrollyAlert.action} canvasId="dashboardCanvas" />
          )}
          {!!othersWalletAddress ? (
            <>
              <ActionBox></ActionBox>
              <BadgeDetailDialog />
            </>
          ) : (
            <>
              <ActionBox mintableBadgeCount={mintableBadges.length} />
              <NameDialog />
              <BadgesDialog mintableBadgeCount={mintableBadges.length} />
              <ReferDialog />
              <UpgradeDialog badges={mintableBadges} loading={pickMintableBadgesLoading} />
              <BadgeDetailDialog />
            </>
          )}
        </GridBg>
      )}
      {badgeAnimationVisible && <FirstBadgeMask badgeWidth={badgewidth}></FirstBadgeMask>}
    </>
  )
}

export default Dashboard
