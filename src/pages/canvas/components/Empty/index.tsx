import Img from "react-cool-img"
import { useNavigate } from "react-router-dom"

import { Stack, Typography } from "@mui/material"

import Button from "@/components/Button"
import useCanvasStore from "@/stores/canvasStore"

const Empty = props => {
  const { sx, title, mintableBadgeCount } = props
  const navigate = useNavigate()
  const { changeUpgradeDialog, changeBadgesDialog } = useCanvasStore()

  const moveToEcosystem = () => {
    navigate("/ecosystem")
    changeUpgradeDialog(false)
    changeBadgesDialog(false)
  }

  const handleOpenMintBadge = () => {
    changeUpgradeDialog(true)
    changeBadgesDialog(false)
  }
  return (
    <Stack justifyContent="center" alignItems="center" height="100%" sx={sx}>
      <Img style={{ width: "20rem", height: "20rem" }} src="/imgs/canvas/Scrolly_Wen.webp" alt="Coding Scrolly" />
      <Typography sx={{ fontSize: "3.2rem", lineHeight: "4.8rem", fontWeight: 600, mb: "0.8rem", color: "primary.contrastText" }}>{title}</Typography>
      <Typography sx={{ fontSize: "1.8rem", lineHeight: "2.8rem", mb: "3.2rem", color: "primary.contrastText" }}>
        Explore protocols offering badges on the ecosystem page.
      </Typography>
      <Stack direction="row" gap="1.6rem">
        <Button color="primary" onClick={moveToEcosystem}>
          Explore badges
        </Button>
        {!!mintableBadgeCount && (
          <Button color="secondary" onClick={handleOpenMintBadge}>
            Mint badges ({mintableBadgeCount})
          </Button>
        )}
      </Stack>
    </Stack>
  )
}

export default Empty
