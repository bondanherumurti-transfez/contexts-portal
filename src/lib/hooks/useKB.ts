"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getKB,
  enrichKB,
  updatePills,
  updateGreeting,
  updateCustomInstructions,
} from "@/lib/api/kb";
import { ApiError } from "@/lib/api/client";
import { KBResponse } from "@/lib/api/types";

export function useKB(kb_id: string | undefined) {
  return useQuery({
    queryKey: ["kb", kb_id],
    queryFn: () => getKB(kb_id!),
    enabled: !!kb_id,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status < 500) return false;
      return failureCount < 1;
    },
  });
}

export function useEnrichKB(kb_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      question,
      answer,
    }: {
      question: string;
      answer: string;
    }) => enrichKB(kb_id, question, answer),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["kb", kb_id] });
    },
  });
}

export function useUpdatePills(kb_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pills: string[]) => updatePills(kb_id, pills),
    onMutate: async (newPills) => {
      await qc.cancelQueries({ queryKey: ["kb", kb_id] });
      const prev = qc.getQueryData<KBResponse>(["kb", kb_id]);
      qc.setQueryData<KBResponse>(["kb", kb_id], (old) =>
        old ? { ...old, pills: newPills } : old,
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["kb", kb_id], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["kb", kb_id] });
    },
  });
}

export function useUpdateGreeting(kb_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (greeting: string | null) => updateGreeting(kb_id, greeting),
    onMutate: async (newGreeting) => {
      await qc.cancelQueries({ queryKey: ["kb", kb_id] });
      const prev = qc.getQueryData<KBResponse>(["kb", kb_id]);
      qc.setQueryData<KBResponse>(["kb", kb_id], (old) =>
        old ? { ...old, greeting: newGreeting } : old,
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["kb", kb_id], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["kb", kb_id] });
    },
  });
}

export function useUpdateCustomInstructions(kb_id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (custom_instructions: string | null) =>
      updateCustomInstructions(kb_id, custom_instructions),
    onMutate: async (newValue) => {
      await qc.cancelQueries({ queryKey: ["kb", kb_id] });
      const prev = qc.getQueryData<KBResponse>(["kb", kb_id]);
      qc.setQueryData<KBResponse>(["kb", kb_id], (old) =>
        old ? { ...old, custom_instructions: newValue } : old,
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["kb", kb_id], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["kb", kb_id] });
    },
  });
}
