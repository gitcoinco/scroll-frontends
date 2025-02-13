import Img from "react-cool-img"

import { List } from "@mui/material"
import { styled } from "@mui/system"

import LoadingPage from "@/components/LoadingPage"
import useCheckViewport from "@/hooks/useCheckViewport"
import Dialog from "@/pages/canvas/components/Dialog"
import Empty from "@/pages/canvas/components/Empty"
import useCanvasStore from "@/stores/canvasStore"

import BadgeItem from "./BadgeItem"

const StyledList = styled(List)(({ theme }) => ({
  width: "57.6rem",
  height: "62.4rem",
  display: "flex",
  flexDirection: "column",
  gap: "2.4rem",
  padding: "2.4rem 0 0",
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(209, 205, 204, 0.30)",
    borderRadius: "8px",
  },
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  // Firefox
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(209, 205, 204, 0.30) transparent",

  "& .MuiListItem-root": {
    gap: "1.6rem",
  },

  [theme.breakpoints.down("sm")]: {
    height: "100%",
    maxHeight: "unset",
  },
}))

const UpgradeDialog = props => {
  const { badges, loading } = props
  const { isMobile } = useCheckViewport()
  const { upgradeDialogVisible, changeUpgradeDialog } = useCanvasStore()

  const handleClose = () => {
    changeUpgradeDialog(false)
  }

  if (loading) {
    return (
      <Dialog title="Mint eligible badges" open={upgradeDialogVisible} onClose={handleClose}>
        <StyledList>
          <LoadingPage
            height="100%"
            component={<Img src="/imgs/canvas/Scrolly_Coding_s.webp" alt="Coding Scrolly" width={isMobile ? "120" : "200"} />}
          ></LoadingPage>
        </StyledList>
      </Dialog>
    )
  }

  if (!badges.length) {
    return (
      <Dialog onClose={handleClose} open={upgradeDialogVisible}>
        <Empty title="No eligible badges for minting" sx={{ width: "57.6rem", height: ["auto", "62.7rem"] }}></Empty>
      </Dialog>
    )
  }

  return (
    <Dialog title="Mint eligible badges" open={upgradeDialogVisible} onClose={handleClose}>
      <StyledList>
        {badges.map((badge, index) => (
          <BadgeItem key={index} badge={badge} />
        ))}
      </StyledList>
    </Dialog>
  )
}

export default UpgradeDialog
