package com.fit.myapp;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.graphics.Typeface;
import android.os.Build;
import android.os.Bundle;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Виджет "Активность" — адаптивный хитмап.
 * Размер ячеек → из высоты виджета.
 * Количество недель → из ширины виджета.
 */
public class ActivityWidget extends AppWidgetProvider {

    static final String ACTION_REFRESH  = "com.fit.myapp.ACTIVITY_WIDGET_REFRESH";
    static final String CAP_PREFS       = "CapacitorStorage";
    static final String MONTH_INDEX_KEY = "workout:month-index";
    static final int    DAYS_PER_WEEK   = 7;

    // Фиксированный UI overhead (dp): padding + заголовок + подзаголовок + статистика
    static final int OVERHEAD_DP     = 55;
    static final int LAYOUT_H_PAD_DP = 32;   // paddingStart + paddingEnd
    static final int LABEL_W_DP      = 17;
    static final int LABEL_GAP_DP    = 4;
    static final int GAP_DP          = 3;
    static final int MIN_CELL_DP     = 16;
    static final int MAX_CELL_DP     = 48;

    // Фолбэк палитра (Material You purple) для Android < 12
    static final int[] FALLBACK_LIGHT = {
        0xFFE8E0F0, 0xFFC9B8E8, 0xFFA689D8, 0xFF7F57C2, 0xFF6750A4
    };
    static final int[] FALLBACK_DARK = {
        0xFF2A2535, 0xFF3D2E5C, 0xFF56427F, 0xFF8B6FBF, 0xFFD0BCFF
    };

    static final String[] DAY_LABELS = {"Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"};

    // ──────────────────────────────────────────────
    @Override
    public void onUpdate(Context ctx, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) updateWidget(ctx, mgr, id);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context ctx, AppWidgetManager mgr,
                                          int id, Bundle opts) {
        updateWidget(ctx, mgr, id);
    }

    @Override
    public void onReceive(Context ctx, Intent intent) {
        super.onReceive(ctx, intent);
        if (ACTION_REFRESH.equals(intent.getAction())) {
            int id = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID,
                    AppWidgetManager.INVALID_APPWIDGET_ID);
            if (id != AppWidgetManager.INVALID_APPWIDGET_ID)
                updateWidget(ctx, AppWidgetManager.getInstance(ctx), id);
        }
    }

    // ──────────────────────────────────────────────
    static void updateWidget(Context ctx, AppWidgetManager mgr, int widgetId) {
        boolean isDark = isNightMode(ctx);
        RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.widget_activity);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            views.setTextColor(R.id.tv_title,
                    ctx.getColor(isDark
                            ? android.R.color.system_neutral1_100
                            : android.R.color.system_neutral1_900));
            views.setTextColor(R.id.tv_subtitle,
                    ctx.getColor(isDark
                            ? android.R.color.system_neutral2_400
                            : android.R.color.system_neutral2_600));
            views.setTextColor(R.id.tv_this_week,
                    ctx.getColor(isDark
                            ? android.R.color.system_neutral1_200
                            : android.R.color.system_neutral1_800));
        } else {
            views.setTextColor(R.id.tv_title,    isDark ? 0xFFFFFFFF : 0xFF1C1C1E);
            views.setTextColor(R.id.tv_subtitle, 0xFF8E8E93);
            views.setTextColor(R.id.tv_this_week, isDark ? 0xFFEBEBF5 : 0xFF3C3C43);
        }

        try {
            float density = ctx.getResources().getDisplayMetrics().density;

            Bundle opts   = mgr.getAppWidgetOptions(widgetId);
            int widthDp   = Math.max(140, opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH,  180));
            int heightDp  = Math.max(100, opts.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 150));

            int gapPx    = Math.max(1, Math.round(GAP_DP      * density));
            int labelPx  = Math.max(1, Math.round(LABEL_W_DP  * density));
            int lgapPx   = Math.max(1, Math.round(LABEL_GAP_DP * density));

            // Размер ячейки из доступной высоты
            int gridHeightDp = Math.max(MIN_CELL_DP * 7, heightDp - OVERHEAD_DP);
            int rawCellPx    = ((int)(gridHeightDp * density) - 6 * gapPx) / DAYS_PER_WEEK;
            int cellPx       = Math.max(Math.round(MIN_CELL_DP * density),
                               Math.min(Math.round(MAX_CELL_DP * density), rawCellPx));

            // Количество недель из доступной ширины
            int availPx  = (int)((widthDp - LAYOUT_H_PAD_DP) * density);
            int gridWPx  = availPx - labelPx - lgapPx;
            int weeks    = Math.max(4, Math.min(52, (gridWPx + gapPx) / (cellPx + gapPx)));

            // Точная ширина ячейки чтобы bitmap заполнил всю ширину
            int cellW = Math.max(1, (gridWPx - (weeks - 1) * gapPx) / weeks);

            int monthsNeeded = (weeks / 4) + 2;
            Map<String, Integer> activity = loadActivity(ctx, monthsNeeded);

            int[] palette = buildPalette(ctx, isDark);
            Bitmap heatmap = drawHeatmap(activity, weeks, cellW, cellPx, gapPx,
                    labelPx, lgapPx, density, isDark, palette);
            views.setImageViewBitmap(R.id.iv_heatmap, heatmap);

            views.setTextViewText(R.id.tv_subtitle, weeksLabel(weeks));

            int daysThisMonth = countThisMonth(activity);
            views.setTextViewText(R.id.tv_this_week,
                    daysThisMonth + " " + pluralDays(daysThisMonth) + " в этом месяце");

        } catch (Exception e) {
            android.util.Log.e("ActivityWidget", "update error", e);
            views.setTextViewText(R.id.tv_this_week, "нет данных");
        }

        Intent intent = new Intent(ctx, ActivityWidget.class);
        intent.setAction(ACTION_REFRESH);
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId);
        PendingIntent pi = PendingIntent.getBroadcast(ctx, widgetId, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        views.setOnClickPendingIntent(R.id.widget_root, pi);

        mgr.updateAppWidget(widgetId, views);
    }

    // ──────────────────────────────────────────────
    static Map<String, Integer> loadActivity(Context ctx, int monthsNeeded) throws Exception {
        SharedPreferences prefs = ctx.getSharedPreferences(CAP_PREFS, Context.MODE_PRIVATE);
        Map<String, Integer> result = new HashMap<>();

        String indexJson = prefs.getString(MONTH_INDEX_KEY, null);
        if (indexJson == null) return result;

        JSONArray monthKeys = new JSONArray(indexJson);
        int from = Math.max(0, monthKeys.length() - monthsNeeded);
        for (int i = from; i < monthKeys.length(); i++) {
            String monthKey  = monthKeys.getString(i);
            String monthJson = prefs.getString(monthKey, null);
            if (monthJson == null) continue;

            JSONObject monthData = new JSONObject(monthJson);
            java.util.Iterator<String> dateKeys = monthData.keys();
            while (dateKeys.hasNext()) {
                String dateKey = dateKeys.next();
                JSONObject dayData = monthData.optJSONObject(dateKey);
                if (dayData == null) continue;
                JSONArray exercises = dayData.optJSONArray("exercises");
                if (exercises != null && exercises.length() > 0)
                    result.put(dateKey, exercises.length());
            }
        }
        return result;
    }

    // ──────────────────────────────────────────────
    // cellW — ширина ячейки, cellH — высота ячейки (могут отличаться)
    static Bitmap drawHeatmap(Map<String, Integer> activity,
                               int weeks, int cellW, int cellH, int gapPx,
                               int labelPx, int lgapPx, float density,
                               boolean isDark, int[] colors) {
        // Размер текста пропорционален ячейке, но не меньше 6sp и не больше 9sp
        int labelTxtSz = Math.max(Math.round(6 * density),
                         Math.min(Math.round(9 * density), (int)(cellH * 0.6f)));

        int bmpW = labelPx + lgapPx + weeks * cellW + (weeks - 1) * gapPx;
        int bmpH = DAYS_PER_WEEK * cellH + (DAYS_PER_WEEK - 1) * gapPx;

        Bitmap bmp = Bitmap.createBitmap(Math.max(1, bmpW), Math.max(1, bmpH),
                Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bmp);
        canvas.drawColor(Color.TRANSPARENT);

        Paint cellPaint = new Paint(Paint.ANTI_ALIAS_FLAG);

        Paint lblPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        lblPaint.setTextSize(labelTxtSz);
        lblPaint.setTypeface(Typeface.DEFAULT);
        lblPaint.setColor(isDark ? 0x66FFFFFF : 0x668E8E93);

        // Метки дней (чётные строки: Пн, Ср, Пт, Вс)
        for (int d = 0; d < DAYS_PER_WEEK; d++) {
            if (d % 2 == 0) {
                float y = d * (cellH + gapPx) + cellH * 0.72f;
                canvas.drawText(DAY_LABELS[d], 0, y, lblPaint);
            }
        }

        int maxCount = 1;
        for (int v : activity.values()) if (v > maxCount) maxCount = v;

        SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy", Locale.getDefault());
        Calendar today = Calendar.getInstance();
        Calendar start = (Calendar) today.clone();
        int dow = start.get(Calendar.DAY_OF_WEEK);
        start.add(Calendar.DAY_OF_YEAR, dow == Calendar.SUNDAY ? -6 : Calendar.MONDAY - dow);
        start.add(Calendar.DAY_OF_YEAR, -(weeks - 1) * 7);

        Calendar cur = (Calendar) start.clone();
        for (int w = 0; w < weeks; w++) {
            for (int d = 0; d < DAYS_PER_WEEK; d++) {
                if (!cur.after(today)) {
                    String dateKey = sdf.format(cur.getTime());
                    Integer count  = activity.get(dateKey);
                    int intensity  = count == null ? 0 : toIntensity(count, maxCount);

                    cellPaint.setColor(colors[intensity]);
                    float left = labelPx + lgapPx + w * (cellW + gapPx);
                    float top  = d * (cellH + gapPx);
                    float r    = Math.min(cellW, cellH) * 0.28f;
                    canvas.drawRoundRect(new RectF(left, top, left + cellW, top + cellH),
                            r, r, cellPaint);
                }
                cur.add(Calendar.DAY_OF_YEAR, 1);
            }
        }

        return bmp;
    }

    // ──────────────────────────────────────────────
    /** Количество тренировочных дней в текущем календарном месяце */
    /**
     * Строит палитру из 5 цветов интенсивности.
     * API 31+: берёт акцентный цвет из системной темы (Material You).
     * Старше: фолбэк на фиолетовый.
     */
    static int[] buildPalette(Context ctx, boolean isDark) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            if (isDark) {
                return new int[]{
                    ctx.getColor(android.R.color.system_neutral1_800),  // 0 — пустой день (нейтральный)
                    ctx.getColor(android.R.color.system_accent1_700),
                    ctx.getColor(android.R.color.system_accent1_500),
                    ctx.getColor(android.R.color.system_accent1_300),
                    ctx.getColor(android.R.color.system_accent1_100),
                };
            } else {
                return new int[]{
                    ctx.getColor(android.R.color.system_neutral1_200),  // 0 — пустой день (нейтральный)
                    ctx.getColor(android.R.color.system_accent1_200),
                    ctx.getColor(android.R.color.system_accent1_400),
                    ctx.getColor(android.R.color.system_accent1_600),
                    ctx.getColor(android.R.color.system_accent1_800),
                };
            }
        }
        return isDark ? FALLBACK_DARK : FALLBACK_LIGHT;
    }

    static int countThisMonth(Map<String, Integer> activity) {
        SimpleDateFormat sdf = new SimpleDateFormat("dd-MM-yyyy", Locale.getDefault());
        Calendar cal = Calendar.getInstance();
        int year  = cal.get(Calendar.YEAR);
        int month = cal.get(Calendar.MONTH);
        int today = cal.get(Calendar.DAY_OF_MONTH);

        cal.set(Calendar.DAY_OF_MONTH, 1);
        int count = 0;
        for (int d = 1; d <= today; d++) {
            cal.set(Calendar.DAY_OF_MONTH, d);
            if (cal.get(Calendar.YEAR) == year && cal.get(Calendar.MONTH) == month) {
                if (activity.containsKey(sdf.format(cal.getTime()))) count++;
            }
        }
        return count;
    }

    static int toIntensity(int count, int maxCount) {
        if (count == 0 || maxCount == 0) return 0;
        double r = (double) count / maxCount;
        if (r >= 0.8) return 4;
        if (r >= 0.55) return 3;
        if (r >= 0.3) return 2;
        return 1;
    }

    static boolean isNightMode(Context ctx) {
        int flags = ctx.getResources().getConfiguration().uiMode
                & Configuration.UI_MODE_NIGHT_MASK;
        return flags == Configuration.UI_MODE_NIGHT_YES;
    }

    static String weeksLabel(int weeks) {
        if (weeks <= 5)  return "Тренировки за месяц";
        if (weeks <= 13) return "Тренировки за 3 месяца";
        if (weeks <= 26) return "Тренировки за полгода";
        return "Тренировки за год";
    }

    static String pluralDays(int n) {
        if (n % 10 == 1 && n % 100 != 11) return "день";
        if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return "дня";
        return "дней";
    }
}
