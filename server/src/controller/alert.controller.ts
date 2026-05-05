import { Request, Response } from "express";
import { AlertService } from "../service/Alert.service";
import { ApiResponse } from "../utils/ApiResponse";

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const alerts = await AlertService.getUserAlerts(`${userId}`);

    res
      .status(200)
      .json(new ApiResponse(200, alerts, "Alerts fetched successfully"));
  } catch (err) {
    console.error(err);
    res.status(500).json(new ApiResponse(500, null, "Failed to fetch alerts"));
  }
};
