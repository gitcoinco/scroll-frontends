import copy from "copy-to-clipboard"
import { useCallback, useEffect, useMemo, useState } from "react"
import Img from "react-cool-img"
import { useLocation, useNavigate } from "react-router-dom"
import { makeStyles } from "tss-react/mui"

import { Box, ButtonBase, Fade, LinearProgress, ListItemIcon, ListItemText, Menu, MenuItem, SvgIcon } from "@mui/material"

import { getSmallAvatarURL } from "@/apis/canvas"
import { ReactComponent as CopySuccessSvg } from "@/assets/svgs/bridge/copy-success.svg"
import { ReactComponent as HistorySvg } from "@/assets/svgs/bridge/history.svg"
import { ReactComponent as BlockSvg } from "@/assets/svgs/wallet-connector/block.svg"
import { ReactComponent as CopySvg } from "@/assets/svgs/wallet-connector/copy.svg"
import { ReactComponent as DisconnectSvg } from "@/assets/svgs/wallet-connector/disconnect.svg"
import { ReactComponent as DownTriangleSvg } from "@/assets/svgs/wallet-connector/down-triangle.svg"
import { ReactComponent as ProfileSvg } from "@/assets/svgs/wallet-connector/profile.svg"
import { CHAIN_ID, EXPLORER_URL } from "@/constants"
import { useCanvasContext } from "@/contexts/CanvasContextProvider"
import { useRainbowContext } from "@/contexts/RainbowProvider"
import useSnackbar from "@/hooks/useSnackbar"
import useBridgeStore from "@/stores/bridgeStore"
import useCanvasStore from "@/stores/canvasStore"
import { generateExploreLink, truncateAddress } from "@/utils"

const useStyles = makeStyles<any>()((theme, { dark }) => ({
  button: {
    fontFamily: "var(--developer-page-font-family)",
    fontSize: "1.6rem",
    height: "4rem",
    width: "16rem",
    padding: "0 1.2rem",
    borderRadius: "0.5rem",
    // width: "16rem",
    border: dark ? `1px solid ${theme.palette.primary.contrastText}` : "none",
    backgroundColor: dark ? "unset" : theme.palette.themeBackground.normal,
    color: dark ? theme.palette.primary.contrastText : "#473835",
    whiteSpace: "nowrap",
  },

  connectButton: {
    fontFamily: "var(--default-font-family)",
    backgroundColor: "#FF684B",
    color: theme.palette.primary.contrastText,
    border: "none",
    fontSize: "1.8rem",
    fontWeight: 500,
  },
  endIcon: {
    fontSize: "1.6rem",
    marginLeft: "0.8rem",
    color: dark ? theme.palette.primary.contrastText : "#473835",
    willChange: "transform",
    transition: "transform .3s ease-in-out",
  },
  reverseEndIcon: {
    transform: "rotate(180deg)",
  },
  paper: {
    borderRadius: "0.5rem",
    border: dark ? `1px solid ${theme.palette.primary.contrastText}` : "none",
    backgroundColor: dark ? theme.palette.text.primary : theme.palette.themeBackground.normal,
    marginTop: "0.5rem",
  },
  list: {
    padding: 0,
  },
  listItem: {
    height: "4rem",
    padding: "0 1.2rem",
    gap: "0.8rem",
  },
  listItemIcon: {
    minWidth: "unset !important",
    color: dark ? theme.palette.primary.contrastText : "#473835",
  },

  listItemText: {
    fontSize: "1.6rem",
    fontFamily: "var(--developer-page-font-family)",
    cursor: "pointer",
    color: dark ? theme.palette.primary.contrastText : "#473835",
  },
}))

const WalletDropdown = props => {
  const { sx, dark } = props
  const { classes, cx } = useStyles({ dark })
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const { walletCurrentAddress, connect, disconnect, chainId } = useRainbowContext()
  const { changeHistoryVisible } = useBridgeStore()

  const { unsignedProfileRegistryContract, publicProvider } = useCanvasContext()
  const { username, profileMinted, walletDetailLoading, checkAndFetchCurrentWalletCanvas, clearCanvas } = useCanvasStore()
  const alertWarning = useSnackbar()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [copied, setCopied] = useState(false)

  const open = useMemo(() => Boolean(anchorEl), [anchorEl])

  useEffect(() => {
    clearCanvas()
  }, [walletCurrentAddress])

  useEffect(() => {
    if (unsignedProfileRegistryContract && walletCurrentAddress) {
      checkAndFetchCurrentWalletCanvas(publicProvider, unsignedProfileRegistryContract, walletCurrentAddress).then(res => {
        if (res !== true) {
          alertWarning(res)
        }
      })
    }

    // re check&&fetch walletCurrentAddress's canvas when switching address on Wallet
  }, [unsignedProfileRegistryContract, walletCurrentAddress])

  const handleClick = e => {
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setCopied(false)
  }

  const viewScan = useCallback(() => {
    window.open(generateExploreLink(EXPLORER_URL[chainId === CHAIN_ID.L1 ? "L1" : "L2"], walletCurrentAddress, "address"))
  }, [walletCurrentAddress, chainId])

  const copyAddress = useCallback(() => {
    copy(walletCurrentAddress as string)
    setCopied(true)
  }, [walletCurrentAddress])

  const operations = useMemo(
    () => [
      {
        icon: ProfileSvg,
        label: "Scroll Canvas",
        action: () => {
          if (profileMinted) {
            navigate("/scroll-canvas")
          } else {
            navigate("/scroll-canvas/mint")
          }
          handleClose()
        },
      },
      {
        icon: HistorySvg,
        label: "Transaction history",
        action: () => {
          changeHistoryVisible(true)
          handleClose()
        },
      },
      {
        icon: BlockSvg,
        label: "Block explorer",
        action: viewScan,
      },
      { icon: copied ? CopySuccessSvg : CopySvg, label: "Copy address", action: copyAddress },
      {
        icon: DisconnectSvg,
        label: "Disconnect",
        action: () => {
          disconnect()
          // clear Canvas states
          clearCanvas()
          handleClose()
        },
      },
    ],
    [pathname, viewScan, copyAddress, copied, disconnect, profileMinted],
  )

  const renderCurrentWallet = () => {
    if (walletDetailLoading) {
      return (
        <ButtonBase classes={{ root: classes.button }} sx={{ position: "relative", overflow: "hidden", ...sx }} onClick={handleClick}>
          {truncateAddress(walletCurrentAddress as string)}
          <SvgIcon className={cx(classes.endIcon, open && classes.reverseEndIcon)} component={DownTriangleSvg} inheritViewBox></SvgIcon>
          {<LinearProgress sx={{ position: "absolute", width: "100%", bottom: 0, height: "2px" }} />}
        </ButtonBase>
      )
    } else if (profileMinted) {
      return (
        <ButtonBase classes={{ root: classes.button }} sx={sx} onClick={handleClick}>
          <Img
            src={getSmallAvatarURL(walletCurrentAddress)}
            style={{ width: 24, height: 24, marginRight: "0.8rem" }}
            placeholder="/imgs/canvas/avatarPlaceholder.svg"
          ></Img>
          <Box sx={{ lineHeight: "1.6rem", textAlign: "left" }}>
            <strong style={{ fontSize: "1.2rem", lineHeight: "1.6rem" }}>{username}</strong>
            <p style={{ fontSize: "1.2rem", lineHeight: "1.6rem" }}>{truncateAddress(walletCurrentAddress as string)}</p>
          </Box>
          <SvgIcon className={cx(classes.endIcon, open && classes.reverseEndIcon)} component={DownTriangleSvg} inheritViewBox></SvgIcon>
        </ButtonBase>
      )
    }
    return (
      <ButtonBase classes={{ root: classes.button }} sx={sx} onClick={handleClick}>
        {truncateAddress(walletCurrentAddress as string)}
        <SvgIcon className={cx(classes.endIcon, open && classes.reverseEndIcon)} component={DownTriangleSvg} inheritViewBox></SvgIcon>
      </ButtonBase>
    )
  }

  return (
    <>
      {walletCurrentAddress ? (
        <>{renderCurrentWallet()}</>
      ) : (
        <ButtonBase classes={{ root: cx(classes.button, classes.connectButton) }} sx={sx} onClick={connect}>
          Connect Wallet
        </ButtonBase>
      )}

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        TransitionComponent={Fade}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        classes={{ paper: classes.paper, list: classes.list }}
      >
        {operations.map(({ icon, label, action }) => (
          <MenuItem key={label} classes={{ root: classes.listItem }} onClick={action}>
            <ListItemIcon classes={{ root: classes.listItemIcon }}>
              <SvgIcon sx={{ fontSize: "1.6rem" }} component={icon} inheritViewBox></SvgIcon>
            </ListItemIcon>
            <ListItemText classes={{ primary: classes.listItemText }}>{label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}

export default WalletDropdown
